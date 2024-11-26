import { useEffect, useRef } from "react";

export const Receiver = ({ socket, Id }: { socket: WebSocket, Id: string }) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const LocalVideoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {

        
        
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
            ],
        });
        getMediaStream(pc)

        pc.ontrack = (event) => {
            event.streams.forEach((stream) => {
                if (event.track.kind === "video" && videoRef.current) {
                    videoRef.current.srcObject = stream;

                }



            });
        };

        socket.onmessage = async (event) => {
            const message = JSON.parse(event.data);



            if (message.type === "createOffer") {
                await pc.setRemoteDescription(new RTCSessionDescription(message.sdp));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                socket.send(
                    JSON.stringify({
                        type: "createAnswer",
                        sdp: pc.localDescription,
                        RoomId: Id
                    })
                );
            } else if (message.type === "iceCandidate") {
                await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
            } else if (message.type === "userDisConnect") {
                alert("meeting over")
            }
        };

        return () => {
            socket.close();
            pc.close();
        };
    }, [socket]);
    const getMediaStream = (peerConnection: RTCPeerConnection) => {
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
                if (LocalVideoRef.current) {
                    LocalVideoRef.current.srcObject = stream;
                    LocalVideoRef.current.play();
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



            <h2>Receiver</h2>
            <video ref={videoRef} width={300} height={300} autoPlay ></video>
            <br />
            <video ref={LocalVideoRef} width={300} height={300} muted autoPlay ></video>
        </div>
    );
};
