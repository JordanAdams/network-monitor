import {
  TimestreamWriteClient,
  WriteRecordsCommand,
  _Record as TimestreamWriteRecord,
} from "@aws-sdk/client-timestream-write";
import { Handler } from "aws-lambda";

interface NetworkSpeedResult {
  upload: number;
  download: number;
  ping: number;
}

interface PushNetworkSpeedEvent {
  ethernet: NetworkSpeedResult;
  wifi: NetworkSpeedResult;
  timestamp: string;
}

interface NetworkSpeedRecord {
  timestamp: number;
  upload: number;
  download: number;
  ping: number;
}

const recordsForInterface = (
  interfaceName: string,
  data: NetworkSpeedRecord
): TimestreamWriteRecord[] => {
  const dimensions = [
    {
      Name: "Interface",
      Value: interfaceName,
      DimensionValueType: "VARCHAR",
    },
  ];

  const baseRecord = {
    Dimensions: dimensions,
    Time: data.timestamp.toString(),
    TimeUnit: "MILLISECONDS",
  };

  return [
    {
      ...baseRecord,
      MeasureName: "upload",
      MeasureValue: data.upload.toString(),
      MeasureValueType: "DOUBLE",
    },
    {
      ...baseRecord,
      MeasureName: "download",
      MeasureValue: data.download.toString(),
      MeasureValueType: "DOUBLE",
    },
    {
      ...baseRecord,
      MeasureName: "ping",
      MeasureValue: data.ping.toString(),
      MeasureValueType: "DOUBLE",
    },
  ];
};

export const handler: Handler<PushNetworkSpeedEvent> = async (event, _) => {
  const { ethernet, wifi } = event;

  const timestamp = new Date(event.timestamp).getTime();

  const timestream = new TimestreamWriteClient({ region: "eu-west-1" });

  await timestream.send(
    new WriteRecordsCommand({
      DatabaseName: "networkMonitor",
      TableName: "dev-networkSpeed",
      Records: [
        ...recordsForInterface("ethernet", { ...ethernet, timestamp }),
        ...recordsForInterface("wifi", { ...wifi, timestamp }),
      ],
    })
  );
};
