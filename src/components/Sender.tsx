import { useEffect, useRef, useState  } from "react";

export const Sender = ({ newSocket ,Id}: { newSocket :WebSocket,Id:string}) => {
      const videoRef = useRef<HTMLVideoElement | null>(null);
    const RemoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const [Peer,SETPeer]=useState<RTCPeerConnection|null>(null)
  
    useEffect(()=>{
        initiateConnection()
        return ()=>{
            Peer?.close()
            newSocket.close()
        }
    },[newSocket])

    const initiateConnection = async () => {
        if (!newSocket) {
            alert("Socket not found");
            return;
        }

        const newPC = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" }, // Public STUN server
            ],
        });
        SETPeer(newPC)
        newPC.ontrack = async(event) => {
            console.log(event.streams[0]);
            
            if (event.track.kind == "video" && RemoteVideoRef.current) {
                RemoteVideoRef.current.srcObject=event.streams[0]
                await RemoteVideoRef.current.play()
            }
        }

        newPC.onicecandidate = (event) => {
          
            
            if (event.candidate) {
                newSocket.send(
                    JSON.stringify({
                        type: "iceCandidate",
                        candidate: event.candidate,
                        RoomId: Id
                    })
                );
            }
        };

        newSocket.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            console.log(message.type);
            
            if (message.type === "createAnswer") {
                await newPC.setRemoteDescription(new RTCSessionDescription(message.sdp));
            } else if (message.type === "iceCandidate") {
                await newPC.addIceCandidate(new RTCIceCandidate(message.candidate));
            } else if (message.type === "userDisConnect") {
                alert("meeting over")
            }
        };

        newPC.onnegotiationneeded = async () => {
            const offer = await newPC.createOffer();
            await newPC.setLocalDescription(offer);

            newSocket.send(
                JSON.stringify({
                    type: "createOffer",
                    sdp: newPC.localDescription,
                    RoomId: Id
                })
            );
        };

        getMediaStream(newPC);
    };

    const getMediaStream = (peerConnection: RTCPeerConnection) => {
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                }

                stream.getTracks().forEach((track) => {
                    peerConnection.addTrack(track, stream);

                });
            })
            .catch((error) => {
                console.error("Error accessing media devices:", error);
            });
    };

    return (
        <div>
            <h2>Sender</h2>
        
            <video ref={videoRef} width={300} height={300} muted></video>
            <br />
            <video ref={RemoteVideoRef} width={300} height={300}  autoPlay></video>
        </div>
    );
};
