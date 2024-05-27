namespace ALU.MQTT_Simulator.Config
{
    public class MQTTConfig
    {
        public string? ConnectionString { get; set; }
        public int? Port { get; set; }
        public string ServerId { get; set; } = "alu-listener";

        public MQTTConfig()
        {
        }
    }
}
