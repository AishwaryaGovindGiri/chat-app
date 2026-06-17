import toast from "react-hot-toast";
import { AuthContext } from "./AuthContext";
import { createContext, useContext, useEffect, useState } from "react";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const { socket, axios } = useContext(AuthContext);

  //function to get all uers for sidebar
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");

    console.log("API Response:", data);

      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  //function to get messages for selected user

  const getMessages = async (userId) => {
    try {

      const { data } = await axios.get(`/api/messages/${userId}`);


      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
   
      toast.error(error.message);
    }
  }

  //function to send mesage to selected user

  const sendMessage = async (messageData)=>{
    try {
        const { data } = await axios.post(`/api/messages/send/${selectedUser._id}` , messageData);
        if(data.success){
            setMessages((prevMessages)=>[...prevMessages , data.newMessage])
        }else{
            toast.error(data.message);
        }
    } catch (error){
        toast.error(error.message);

    }
  }

  // function to subscribe to messages for selected user
  //when socket emit new msg --> subscribeToMessages catches that message event 
  const subscribeToMessages = () =>{
    if(!socket) return ;

    socket.on("newMessage" , (newMessage)=>{
        console.count("newMessage listener fired");

      console.log("Socket message:", newMessage);
      if(selectedUser && newMessage.senderId === selectedUser._id){
        newMessage.seen = true;
        setMessages((prevMessages)=> [...prevMessages , newMessage]);
        axios.put(`/api/messages/mark/${newMessage._id}`)
      }
      else{
        setUnseenMessages((prevUnseenMessages)=>({
          ...prevUnseenMessages , [newMessage.senderId] : prevUnseenMessages[newMessage.senderId] ?
           prevUnseenMessages[newMessage.senderId] + 1 : 1 
        }))
      }
        
    })
  }


  // function to unsubscribe from messages 
   const unsubscribeFromMessages = ()=>{
    if(socket) socket.off("newMessage");
   }

    useEffect(()=>{
      subscribeToMessages();
      return ()=> unsubscribeFromMessages()
    } , [socket , selectedUser])


  const value = {
    messages , users , selectedUser , getUsers , getMessages 
     , sendMessage , setSelectedUser ,
      unseenMessages , setUnseenMessages
  };
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};



// A sends message
//       ↓
// sendMessage()
//       ↓
// Backend stores message
//       ↓
// Socket emits "newMessages"
//       ↓
// B's subscribeToMessages() catches event
//       ↓
// setMessages(...)
//       ↓
// B sees the message instantly