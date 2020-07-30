package main

import (
	"context"
	"flag"
	"log"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/connect"
)

func main() {
	region := flag.String("r", "", "The AWS region where your Amazon Connect instance is in")
	contactFlowID := flag.String("c", "", "The ID of the contact flow to use when the caller connects to the instance")
	phoneNumber := flag.String("p", "", "The phone number to begin an outbound voice contact with, in E.164 format")
	queueID := flag.String("q", "", "The ARN of the Amazon Connect queue")
	instanceID := flag.String("i", "", "The ID of the Amazon Connect instance with a valid phone number")
	flag.Parse()

	// Create a new AWS session
	sess := session.Must(session.NewSession())

	// Use the session to create an Amazon Connect client for the configured region
	svc := connect.New(sess, &aws.Config{Region: region})

	// Create the input for the the GetCurrentMetricData API
	input := &connect.StartOutboundVoiceContactInput{
		ContactFlowId:          contactFlowID,
		DestinationPhoneNumber: phoneNumber,
		QueueId:                queueID,
		InstanceId:             instanceID,
	}
	if err := input.Validate(); err != nil {
		log.Fatalf("Error validating StartOutboundVoiceContactInput: %v", err)
		return
	}

	output, err := svc.StartOutboundVoiceContactWithContext(context.Background(), input)
	if err != nil {
		log.Fatalf("Error calling StartOutboundVoiceContactWithContext: %v", err)
		return
	}

	// Use a default context, the input, and the pager to call the GetCurrentMetricData API.
	log.Printf("Got StartOutboundVoiceContactWithContext output: %s", output.String())
}
