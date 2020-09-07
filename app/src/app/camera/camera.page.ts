import {Component} from '@angular/core';

const ICE_SERVERS: RTCIceServer[] = [
  {urls: ['stun:stun.example.com', 'stun:stun-1.example.com']},
  {urls: 'stun:stun.l.google.com:19302'}
];

const PEER_CONNECTION_CONFIG: RTCConfiguration = {
  iceServers: ICE_SERVERS
};

@Component({
  selector: 'app-camera',
  templateUrl: './camera.page.html',
  styleUrls: ['./camera.page.scss'],
})

export class CameraPage {
  
  private pc: RTCPeerConnection;
  private dataChannel: RTCDataChannel;
  private url: string = 'wss://admin:Dylan4Life@192.168.0.18:4200/stream/webrtc';
  private ws: WebSocket;

  constructor () { }

  async hangup() {
    var request = {
      what: "hangup"
    };
    console.dir(request);
    await this.ws.send(JSON.stringify(request));
  }

  startCall() {
    
    //Initialize the peerConnection
    this.setupPeerConnection();
 
    //Send the call commmand
    let req = {
        what: "call",
        options: {
            force_hw_vcodec: false,
            vformat: 30
        }
    };
 
    this.ws.send(JSON.stringify(req));
    console.log("Initiating call request" + JSON.stringify(req));
 
  }

  websocketEvents() {
    console.log(this.url);
    this.ws = new WebSocket(this.url);
 
    this.ws.onopen = () => {
        console.log("websocket open");
 
        this.startCall();
 
    };
 
    /*** Signaling logic ***/
    this.ws.onmessage = (event) => {
        let message = JSON.parse(event.data);
        console.log("Incoming message:" + JSON.stringify(message));
 
        if (!message.what) {
            console.error("Websocket message not defined");
            return;
        }
 
        switch (message.what) {
 
            case "offer":
              this.offerAnswer(JSON.parse(message.data));
                break;
 
            case "iceCandidates":
              this.onIceCandidates(JSON.parse(message.data));
                break;
 
            default:
                console.warn("Unhandled websocket message: " + JSON.stringify(message))
        }
    };
 
    this.ws.onerror = (err) => {
        console.error("Websocket error: " + err.toString());
    };
 
    this.ws.onclose = () => {
        console.log("Websocket closed.");
    };
 
  }

  //////////////////////////
/*** Peer Connection ***/

setupPeerConnection() {
  const pcConfig = {
      iceServers: [{
          urls: [
              //"stun:stun.l.google.com:19302",
              "stun:stun.l.google.com:19302"
          ]
      }]
  };

  //Setup our peerConnection object
  this.pc = new RTCPeerConnection(pcConfig);

  let remoteVideo: HTMLVideoElement = document.getElementById('remoteVideo') as HTMLVideoElement;

  //Start video
  this.pc.ontrack = (event) => {
    
      if (remoteVideo.srcObject !== event.streams[0]) {
          remoteVideo.srcObject = event.streams[0];
          remoteVideo.play()
              .then(() => console.log('Remote stream added.'));
      }
  };

  // this.pc.onremovestream = (event) => {
  //     console.log('Remote stream removed. Event: ', event);
  //     remoteVideo.stop();
  // };

  //Handle datachannel messages
  this.pc.ondatachannel = (event) => {

    this.dataChannel = event.channel;

    this.dataChannel.onopen = () => console.log("Data Channel opened");

    this.dataChannel.onerror = (err) => console.error("Data Channel Error:", err);

    this.dataChannel.onmessage = (event) => {
        console.log("DataChannel Message:", event.data);
      };

    this.dataChannel.onclose = () => console.log("The Data Channel is Closed");
  };

  console.log('Created RTCPeerConnnection');

  }

  onIceCandidates(remoteCandidates) {

    function onAddIceCandidateSuccess() {
        console.log("Successfully added ICE candidate")
    }

    function onAddIceCandidateError(err) {
        console.error("Failed to add candidate: " + err)
    }

    remoteCandidates.forEach((candidate) => {
        let generatedCandidate = new RTCIceCandidate({
            sdpMLineIndex: candidate.sdpMLineIndex,
            candidate: candidate.candidate,
            sdpMid: candidate.sdpMid
        });
        console.log("Created ICE candidate: " + JSON.stringify(generatedCandidate));
        this.pc.addIceCandidate(generatedCandidate)
            .then(onAddIceCandidateSuccess, onAddIceCandidateError);
    });
  }

  offerAnswer(remoteSdp) {

    //Start the answer by setting the remote SDP
    this.pc.setRemoteDescription(new RTCSessionDescription(remoteSdp))
        .then(() => {
                console.log("setRemoteDescription complete");

                //Create the local SDP
                this.pc.createAnswer()
                    .then(
                        (localSdp) => {
                          this.pc.setLocalDescription(localSdp)
                                .then(() => {
                                        console.log("setLocalDescription complete");

                                        //send the answer
                                        let req = {
                                            what: "answer",
                                            data: JSON.stringify(localSdp)
                                        };
                                        this.ws.send(JSON.stringify(req));
                                        console.log("Sent local SDP: " + JSON.stringify(localSdp));

                                    },
                                    (err) => console.error("setLocalDescription error:" + err));
                        },
                        (err) =>
                            console.log('Failed to create session description: ' + err.toString())
                    );
            },
            (err) => console.error("Failed to setRemoteDescription: " + err));

    //Now ask for ICE candidates
    console.log("telling uv4l-server to generate IceCandidates");
    this.ws.send(JSON.stringify({what: "generateIceCandidates"}));
    
  }

}