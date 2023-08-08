import { CSSProperties, useState } from "react";
import {
  AgoraRTCProvider,
  useJoin,
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
  usePublish,
  useRTCClient,
  useRemoteAudioTracks,
  useRemoteUsers,
  RemoteUser,
  LocalVideoTrack,
} from "agora-rtc-react";
import AgoraRTC from "agora-rtc-sdk-ng";
import "./App.css";

function App() {
  const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
  return (
    <AgoraRTCProvider client={client}>
      <Container />
    </AgoraRTCProvider>
  )
}
// Uint8Array and exactly equal to 32 bytes
const salt = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 1, 2]);

function Container() {
  const client = useRTCClient();
  const [channelName, setChannelName] = useState("test");
  const [AppID, setAppID] = useState("");
  const [token, setToken] = useState("");
  const [inCall, setInCall] = useState(false);

  return (
    <div style={styles.container}>
      <h1>Agora React Videocall</h1>
      <button onClick={() => {
        client.setEncryptionConfig("aes-128-gcm2", "!@#ASDasd123", salt)
        // @ts-expect-error hidden property
        console.log("client._encryption", client._encryptionMode)
      }}>setEncryptionConfig</button>
      <Form
        AppID={AppID}
        setAppID={setAppID}
        channelName={channelName}
        setChannelName={setChannelName}
        token={token}
        setToken={setToken}
        setInCall={setInCall}
      />
      <Videos channelName={channelName} AppID={AppID} token={token} inCall={inCall} />
      <br /><br />
      <button onClick={() => setInCall(false)}>End Call</button>
    </div>
  );
}

function Videos(props: { channelName: string; AppID: string; token: string; inCall: boolean }) {
  const { AppID, channelName, token, inCall } = props;
  const { isLoading: isLoadingMic, localMicrophoneTrack } = useLocalMicrophoneTrack(inCall);
  const { isLoading: isLoadingCam, localCameraTrack } = useLocalCameraTrack(inCall);
  const remoteUsers = useRemoteUsers();
  const { audioTracks } = useRemoteAudioTracks(remoteUsers);

  usePublish([localMicrophoneTrack, localCameraTrack], inCall);
  useJoin({
    appid: AppID,
    channel: channelName,
    token: token === "" ? null : token,
  }, inCall);

  audioTracks.map((track) => track.play());
  const deviceLoading = isLoadingMic || isLoadingCam;
  if (deviceLoading) return <div style={styles.grid}>Loading devices...</div>;

  return (
    <div style={{ ...styles.grid, ...returnGrid(remoteUsers) }}>
      <LocalVideoTrack track={localCameraTrack} play={true} style={styles.gridCell} />
      {remoteUsers.map((user) => (
        <RemoteUser user={user} style={styles.gridCell} />
      ))}
    </div>
  );
}

/* Standard form to enter AppID and Channel Name */
function Form(props: {
  AppID: string;
  setAppID: React.Dispatch<React.SetStateAction<string>>;
  channelName: string;
  setChannelName: React.Dispatch<React.SetStateAction<string>>;
  token: string;
  setToken: React.Dispatch<React.SetStateAction<string>>;
  setInCall: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { AppID, setAppID, channelName, setChannelName, token, setToken, setInCall } = props;
  return (
    <div>
      <p>Please enter your Agora AppID and Channel Name</p>
      <label htmlFor="appid">Agora App ID: </label>
      <input id="appid" type="text" value={AppID} onChange={(e) => setAppID(e.target.value)} placeholder="required" />
      <br /><br />
      <label htmlFor="channel">Channel Name: </label>
      <input id="channel" type="text" value={channelName} onChange={(e) => setChannelName(e.target.value)} placeholder="required" />
      <br /><br />
      <label htmlFor="token">Channel Token: </label>
      <input id="token" type="text" value={token} onChange={(e) => setToken(e.target.value)} placeholder="optional" />
      <br /><br />
      <button onClick={() => AppID && channelName ? setInCall(true) : alert("Please enter Agora App ID and Channel Name")}>
        Join
      </button>
    </div>
  );
}

export default App;

/* Style Utils */
const returnGrid = (remoteUsers: Array<any>) => {
  return {
    gridTemplateColumns:
      remoteUsers.length > 8
        ? unit.repeat(4)
        : remoteUsers.length > 3
          ? unit.repeat(3)
          : remoteUsers.length > 0
            ? unit.repeat(2)
            : unit,
  };
};
const unit = "minmax(0, 1fr) ";
const styles = {
  grid: {
    width: "100%",
    height: "100%",
    display: "grid",
  },
  gridCell: { height: "100%", width: "100%" },
  container: {
    display: "flex",
    flexDirection: "column" as CSSProperties["flexDirection"],
    flex: 1,
    justifyContent: "center",
  },
};
