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
  const client = useRTCClient(AgoraRTC.createClient({ codec: "vp8", mode: "rtc" }));
  const [channelName, setChannelName] = useState("test");
  const [AppID, setAppID] = useState("");
  const [token, setToken] = useState("");
  const [inCall, setInCall] = useState(false);
  
  return (
    <div style={styles.container}>
      <h1>Agora React Videocall</h1>
      <button onClick={()=>{
        client.setEncryptionConfig("aes-128-ecb", "!@#ASDasd123", )
        // @ts-expect-error
        console.log("client._encryption", client._encryptionMode)
      }}>setEncryptionConfig</button>
      {!inCall ? (
        <Form
          AppID={AppID}
          setAppID={setAppID}
          channelName={channelName}
          setChannelName={setChannelName}
          token={token}
          setToken={setToken}
          setInCall={setInCall}
        />
      ) : (
        <AgoraRTCProvider client={client}>
          <Videos channelName={channelName} AppID={AppID} token={token} />
          <br /><br />
          <button onClick={() => setInCall(false)}>End Call</button>
        </AgoraRTCProvider>
      )}
    </div>
  );
}

function Videos(props: { channelName: string; AppID: string; token: string }) {
  const { AppID, channelName, token } = props;
  const { isLoading: isLoadingMic, localMicrophoneTrack } = useLocalMicrophoneTrack();
  const { isLoading: isLoadingCam, localCameraTrack } = useLocalCameraTrack();
  const remoteUsers = useRemoteUsers();
  const { audioTracks } = useRemoteAudioTracks(remoteUsers);

  usePublish([localMicrophoneTrack, localCameraTrack]);
  useJoin({
    appid: AppID,
    channel: channelName,
    token: token === "" ? null : token,
  });

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
  setAppID: Function;
  channelName: string;
  setChannelName: Function;
  token: string;
  setToken: Function;
  setInCall: Function;
}) {
  const {} = props;
  const { AppID, setAppID, channelName, setChannelName, token, setToken, setInCall } = props;
  return (
    <div>
      <p>Please enter your Agora AppID and Channel Name</p>
      <label htmlFor="appid">Agora App ID: </label>
      <input id="appid" type="text" value={AppID} onChange={(e) => setAppID(e.target.value)} placeholder="required"/>
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
