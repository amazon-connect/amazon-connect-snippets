using System;
using System.Threading.Tasks;

using Amazon.Connect;
using Amazon.Connect.Model;

namespace OutboundExample
{
    class Program
    {
        static async Task Main(string[] args)
        {
            var client = new AmazonConnectClient();
            var request = new StartOutboundVoiceContactRequest {
                InstanceId="c2e9dc6f-3f69-40e2-b0ec-f78d0c62bee6",
                ContactFlowId="ae4e2be3-5541-4c57-9738-217052e61eb3",
                SourcePhoneNumber="+12065550100",
                DestinationPhoneNumber="+12065550101",
                ClientToken="put something random here"
            };
            var response = await client.StartOutboundVoiceContactAsync(request);
            Console.WriteLine(response);
        }
    }
}
