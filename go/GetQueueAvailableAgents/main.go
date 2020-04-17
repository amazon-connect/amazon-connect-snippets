/*
   Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This file is licensed under the Apache License, Version 2.0 (the "License").
   You may not use this file except in compliance with the License. A copy of
   the License is located at

    http://aws.amazon.com/apache2.0/

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
   CONDITIONS OF ANY KIND, either express or implied. See the License for the
   specific language governing permissions and limitations under the License.
*/

package main

import (
	"context"
	"flag"
	"log"
	"strings"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/connect"
)

func main() {
	region := flag.String("r", "", "The AWS region where your Amazon Connect instance is in")
	queueARN := flag.String("q", "", "The ARN of the Amazon Connect queue")
	flag.Parse()

	// Create a new AWS session
	sess := session.Must(session.NewSession())

	// Use the session to create an Amazon Connect client for the configured region
	svc := connect.New(sess, &aws.Config{Region: region})

	// Create the input for the the GetCurrentMetricData API
	// This will request a count of the number of Agents available in the queue
	instanceARN := strings.Join(strings.Split(aws.StringValue(queueARN), "/")[:2], "/") // instance ARN from queue ARN
	input := &connect.GetCurrentMetricDataInput{
		CurrentMetrics: []*connect.CurrentMetric{
			{
				Name: aws.String(connect.CurrentMetricNameAgentsAvailable),
				Unit: aws.String(connect.UnitCount),
			},
		},
		Filters: &connect.Filters{
			Channels: []*string{aws.String(connect.ChannelVoice)},
			Queues:   []*string{queueARN},
		},
		Groupings:  []*string{aws.String(connect.GroupingQueue)},
		InstanceId: aws.String(instanceARN),
	}
	if err := input.Validate(); err != nil {
		log.Fatalf("Error validating GetCurrentMetricDataInput: %v", err)
		return
	}

	// Create a pager. This will let us page over all of the metrics available
	// when there are more metrics than can be returned in a single request
	var count float64
	pager := func(out *connect.GetCurrentMetricDataOutput, lastPage bool) bool {
		for _, result := range out.MetricResults {
			for _, collection := range result.Collections {
				// If the metric returned is for the number of available agents, increment the counter
				if aws.StringValue(collection.Metric.Name) == connect.CurrentMetricNameAgentsAvailable {
					count += aws.Float64Value(collection.Value)
				}
			}
		}
		return lastPage
	}
	if err := svc.GetCurrentMetricDataPagesWithContext(context.Background(), input, pager); err != nil {
		log.Fatalf("Error calling GetCurrentMetricDataPagesWithContext: %v", err)
		return
	}

	// Use a default context, the input, and the pager to call the GetCurrentMetricData API.
	log.Printf("There are %d available agents in the queue.", int(count))
}
