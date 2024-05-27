using ALU.MQTT_Simulator;
using ALU.MQTT_Simulator.Config;
using NLog.Web;

var builder = Host.CreateApplicationBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddNLogWeb();

builder.Services.Configure<MQTTConfig>(builder.Configuration.GetSection("Mqtt"));

builder.Services.AddHostedService<Proizvodnja2DataPublisher>();
builder.Services.AddHostedService<Proizvodnja2BazaPublisher>();
builder.Services.AddHostedService<Proizvodnja2ZavojPublisher>();

var host = builder.Build();
host.Run();
