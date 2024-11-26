import { useEffect, useMemo, useState } from "react";
import { Sender } from "./Sender";
import { Receiver } from "./Receiver";


const Home = () => {
    const [component, setComponent] = useState<string | null>(null)
    const [RoomId, setRooId] = useState<string >("")
    const [waiting,setWaiting] = useState<string>("null")
    const socket = useMemo(() => new WebSocket("ws://localhost:8080"), [])
    useEffect(() => {
       
        socket.onmessage = (message) => {
            const data = JSON.parse(message.data)
            if (data.type == "user") {
                setComponent(data.who)
                setRooId(data.Id)
                setWaiting("Add")
            } else if (data.type == "waiting") {
               
                setWaiting( "Waiting")
            }
        }
        return () => {
            socket.close()
        }
    }, [])
    console.log(waiting);
    

    const Join=()=>{
        
            socket.send(
                JSON.stringify({
                    type: "user",
                })
            );
        
    }
    return (
        <div>
            home
            {waiting=="null" &&<button onClick={() => Join()}>Join Room</button>}
            {
                component != null && component == "sender" ? <Sender newSocket={socket} Id={RoomId} /> : component == "receiver" && <Receiver socket={socket} Id={RoomId} />
            }{
                waiting =="Waiting" && <div>loading ......</div>
            }
        </div>
    );
};

export default Home;