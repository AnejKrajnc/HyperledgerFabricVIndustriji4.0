using Microsoft.Extensions.Options;
using MQTTnet.Client;
using MQTTnet;
using ALU.MQTT_Simulator.Config;

namespace ALU.MQTT_Simulator
{
    public class Proizvodnja2DataPublisher(ILogger<Proizvodnja2DataPublisher> logger, IOptions<MQTTConfig> options) : BackgroundService
    {
        private readonly ILogger<Proizvodnja2DataPublisher> _logger = logger;
        //private readonly IHubContext<DataHub, IDataHub> _hub = hub;
        private readonly MQTTConfig _options = options.Value;

        private const int TimeDelay = 1000;

        private readonly string DataFile = "Proizvodnja2Data.txt";
        private readonly string Topic = "Podjetje/Produkt/Proizvodnja2/PV/Data";

        private int lineIndex = 0;

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            MqttFactory mqttFactory = new();

            using IMqttClient mqttClient = mqttFactory.CreateMqttClient();

            var mqttClientOptions = new MqttClientOptionsBuilder()
                .WithClientId($"{_options.ServerId}_data")
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
                    //_logger.LogInformation($"{lineIndex} - {split[1][0..10]}");
                    await mqttClient.PublishStringAsync(Topic, split[1], cancellationToken: stoppingToken);
                }
                else
                    _logger.LogInformation("{i} - EMPTY", lineIndex);

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
