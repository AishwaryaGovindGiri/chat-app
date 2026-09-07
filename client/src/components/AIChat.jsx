import React, { useContext, useState } from 'react'
import axios from 'axios'
import { ChatContext } from '../../context/ChatContext'

const AIChat = () => {

  const { aiMessages, setAiMessages } = useContext(ChatContext)

  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const sendMessage = async (e) => {
    e.preventDefault()

    if (!message.trim() || loading) return

    const userMessage = message.trim()

    // Add user's message
    setAiMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: userMessage
      }
    ])

    setMessage("")
    setLoading(true)

    try {

      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/ai/chat`,
        {
          message: userMessage
        },
        {
          headers: {
            token: localStorage.getItem("token")
          }
        }
      )

      if (data.success) {

        // Add AI response
        setAiMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: data.reply
          }
        ])

      } else {

        setAiMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: "Sorry, I could not generate a response."
          }
        ])

      }

    } catch (error) {

      console.log("AI Chat Error:", error)

      setAiMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Sorry, something went wrong."
        }
      ])

    } finally {
      setLoading(false)
    }
  }


  return (

    <div className='h-full flex flex-col'>

      {/* Header */}

      <div className='flex items-center gap-3 px-5 py-4 border-b border-gray-600'>

        <div className='w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center text-xl'>
          🤖
        </div>

        <div>

          <p className='text-white font-medium'>
            AI Assistant
          </p>

          <span className='text-green-400 text-xs'>
            Online
          </span>

        </div>

      </div>


      {/* Messages */}

      <div className='flex-1 overflow-y-auto p-5 space-y-4'>

        {aiMessages.length === 0 && (

          <div className='h-full flex flex-col items-center justify-center text-gray-400'>

            <div className='text-5xl mb-4'>
              🤖
            </div>

            <p className='text-lg text-white'>
              AI Assistant
            </p>

            <p className='text-sm mt-1'>
              Ask me anything!
            </p>

          </div>

        )}


        {aiMessages.map((msg, index) => (

          <div
            key={index}
            className={`flex ${
              msg.sender === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >

            <div
              className={`max-w-[75%] px-4 py-3 rounded-lg ${
                msg.sender === "user"
                  ? "bg-violet-500 text-white"
                  : "bg-[#282142] text-gray-100"
              }`}
            >
              {msg.text}
            </div>

          </div>

        ))}


        {loading && (

          <div className='flex justify-start'>

            <div className='bg-[#282142] text-gray-400 px-4 py-3 rounded-lg'>
              Gemini is thinking...
            </div>

          </div>

        )}

      </div>


      {/* Input */}

      <form
        onSubmit={sendMessage}
        className='p-4 border-t border-gray-600 flex gap-3'
      >

        <input
          type='text'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder='Ask AI something...'
          className='flex-1 bg-[#282142] text-white rounded-lg px-4 py-3 outline-none placeholder-gray-400'
        />

        <button
          type='submit'
          disabled={loading}
          className='bg-violet-500 hover:bg-violet-600 text-white px-5 rounded-lg disabled:opacity-50'
        >
          Send
        </button>

      </form>

    </div>

  )
}

export default AIChat