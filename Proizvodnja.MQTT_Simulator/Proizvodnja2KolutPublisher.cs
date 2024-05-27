using ALU.MQTT_Simulator.Config;
using Microsoft.Extensions.Options;
using MQTTnet.Client;
using MQTTnet;

namespace ALU.MQTT_Simulator
{
    internal class Proizvodnja2ZavojPublisher(ILogger<Proizvodnja2ZavojPublisher> logger, IOptions<MQTTConfig> options) : BackgroundService
    {
        //private readonly IHubContext<DataHub, IDataHub> _hub = hub;
        private readonly MQTTConfig _options = options.Value;

        private const int TimeDelay = 1000 * 60 * 8;

        private readonly string DataFile = "Proizvodnja2ZavojData.txt";
        private readonly string Topic = "Podjetje/Produkt/Proizvodnja2/Zavoj/Data";

        private int lineIndex = 0;

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            await Task.Delay(3000); // wait 3secs
            MqttFactory mqttFactory = new();

            using IMqttClient mqttClient = mqttFactory.CreateMqttClient();

            var mqttClientOptions = new MqttClientOptionsBuilder()
                .WithClientId($"{_options.ServerId}_Zavoj")
                .WithTcpServer(_options.ConnectionString, _options.Port)
                .Build();

            await mqttClient.ConnectAsync(mqttClientOptions, stoppingToken);

            StreamReader reader = new(DataFile);
            while (!stoppingToken.IsCancellationRequested)
            {
                string? line = GetLine(reader);
                if (line != null)
                {
                    string[] split = line.Split(";");
                    logger.LogInformation($"{lineIndex} - {split[1][0..10]}");
                    await mqttClient.PublishStringAsync(Topic, split[1], cancellationToken: stoppingToken);
                }
                else
                    logger.LogInformation("{i} - EMPTY", lineIndex);

                await Task.Delay(TimeDelay, stoppingToken);
            }
            await mqttClient.DisconnectAsync(cancellationToken: stoppingToken);
        }

        private string? GetLine(StreamReader reader)
        {
            string? line = reader.ReadLine();
            if (line == null && reader.EndOfStream)
            {
                lineIndex = 0;
                //_logger.LogInformation("Setting to beginning.");
                reader.DiscardBufferedData();
                reader.BaseStream.Seek(0, SeekOrigin.Begin);
                line = reader.ReadLine();
            }

            lineIndex++;
            return line;
        }
    }
}
