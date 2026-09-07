import React, { useContext, useEffect, useState, useRef } from 'react'
import assets from '../assets/assets'
import { formatMessageTime } from '../lib/utils'
import { ChatContext } from '../../context/ChatContext'
import { AuthContext } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const ChatContainer = () => {

  console.count("ChatContainer render")

  const {
    messages,
    selectedUser,
    setSelectedUser,
    sendMessage,
    getMessages
  } = useContext(ChatContext)

  const {
    authUser,
    onlineUsers,
    axios
  } = useContext(AuthContext)

  const scrollEnd = useRef()

  const [input, setInput] = useState('')

  // AI REPLY
  const [suggestions, setSuggestions] = useState([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  // AI GIF
  const [reactionSearch, setReactionSearch] = useState("")
  const [reactionGifs, setReactionGifs] = useState([])
  const [loadingReaction, setLoadingReaction] = useState(false)
  const [selectedGif, setSelectedGif] = useState(null)


  // ---------------- SEND MESSAGE ----------------

  const handleSendMessage = async (e) => {

    e?.preventDefault()

    if (input.trim() === "") return

    await sendMessage({
      text: input.trim()
    })

    setInput("")
  }


  // ---------------- SEND IMAGE ----------------

  const handleSendImage = async (e) => {

    const file = e.target.files[0]

    if (!file || !file.type.startsWith("image/")) {
      toast.error("select an image file")
      return
    }

    const reader = new FileReader()

    reader.onloadend = async () => {

      await sendMessage({
        image: reader.result
      })

      e.target.value = ""
    }

    reader.readAsDataURL(file)
  }


  // ---------------- GET MESSAGES ----------------

  useEffect(() => {

    if (selectedUser) {
      getMessages(selectedUser.id)
    }

  }, [selectedUser])


  // ---------------- SCROLL ----------------

  useEffect(() => {

    if (scrollEnd.current && messages) {

      scrollEnd.current.scrollIntoView({
        behavior: "smooth"
      })

    }

  }, [messages])


  // ---------------- AI REPLY SUGGESTIONS ----------------

  const getSuggestions = async () => {

    if (!selectedUser || messages.length === 0) {

      toast.error(
        "There are no messages to suggest a reply for"
      )

      return
    }


    const otherUserMessages = messages.filter(
      (msg) => msg.sender_id !== authUser.id
    )


    if (otherUserMessages.length === 0) {

      toast.error(
        "Wait for the other person to send a message"
      )

      return
    }


    const latestMessage =
      otherUserMessages[
        otherUserMessages.length - 1
      ]


    if (!latestMessage.text) {

      toast.error(
        "The latest message does not contain text"
      )

      return
    }


    setLoadingSuggestions(true)
    setSuggestions([])


    try {

      const { data } = await axios.post(

        `${import.meta.env.VITE_BACKEND_URL}/api/ai/suggestions`,

        {
          message: latestMessage.text
        },

        {
          headers: {
            token: localStorage.getItem("token")
          }
        }

      )


      console.log(
        "AI Suggestions Response:",
        data
      )


      if (data.success) {

        setSuggestions(
          data.suggestions
        )

      } else {

        toast.error(
          data.message ||
          "Failed to generate suggestions"
        )

      }


    } catch (error) {

      console.log(
        "AI Suggestions Error:",
        error.response?.data ||
        error.message
      )


      toast.error(
        error.response?.data?.message ||
        "AI suggestions are temporarily unavailable"
      )


    } finally {

      setLoadingSuggestions(false)

    }

  }


  // ---------------- SELECT SUGGESTION ----------------

  const selectSuggestion = (suggestion) => {

    setInput(suggestion)

    setSuggestions([])

  }


  // ---------------- AI GIF / STICKER REACTION ----------------

  const getAIReaction = async () => {

    if (!selectedUser || messages.length === 0) {

      toast.error(
        "There are no messages to react to"
      )

      return
    }


    const otherUserMessages = messages.filter(
      (msg) => msg.sender_id !== authUser.id
    )


    if (otherUserMessages.length === 0) {

      toast.error(
        "Wait for the other person to send a message"
      )

      return
    }


    const latestMessage =
      otherUserMessages[
        otherUserMessages.length - 1
      ]


    if (!latestMessage.text) {

      toast.error(
        "The latest message does not contain text"
      )

      return
    }


    setLoadingReaction(true)

    setReactionSearch("")

    setReactionGifs([])

    setSelectedGif(null)


    try {

      // GEMINI

      const { data } = await axios.post(

        `${import.meta.env.VITE_BACKEND_URL}/api/ai/reaction`,

        {
          message: latestMessage.text
        },

        {
          headers: {
            token: localStorage.getItem("token")
          }
        }

      )


      console.log(
        "AI Reaction Response:",
        data
      )


      if (!data.success) {

        toast.error(
          data.message ||
          "Failed to understand the reaction"
        )

        return
      }


      const searchQuery =
        data.searchQuery


      setReactionSearch(
        searchQuery
      )


      // GIPHY

      const giphyUrl =
        `https://api.giphy.com/v1/gifs/search` +
        `?api_key=${import.meta.env.VITE_GIPHY_API_KEY}` +
        `&q=${encodeURIComponent(searchQuery)}` +
        `&limit=8` +
        `&rating=g`


      const giphyResponse =
        await fetch(giphyUrl)


      if (!giphyResponse.ok) {

        throw new Error(
          "GIPHY request failed"
        )

      }


      const giphyData =
        await giphyResponse.json()


      console.log(
        "GIPHY Response:",
        giphyData
      )


      if (
        !giphyData.data ||
        giphyData.data.length === 0
      ) {

        toast.error(
          "No GIFs found"
        )

        return
      }


      setReactionGifs(
        giphyData.data
      )


    } catch (error) {

      console.log(
        "AI GIF Error:",
        error.response?.data ||
        error.message
      )


      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Unable to find GIFs"
      )


    } finally {

      setLoadingReaction(false)

    }

  }


  // ---------------- SELECT GIF ----------------

  const handleSelectGif = (gif) => {

    setSelectedGif(gif)

  }


  // ---------------- SEND GIF ----------------

  const handleSendGif = async () => {

    if (!selectedGif) {

      toast.error(
        "Please select a GIF first"
      )

      return
    }


    try {

      const gifUrl =
        selectedGif.images.original.url


      await sendMessage({
        gif_url: gifUrl
      })


      // Clear GIF picker

      setSelectedGif(null)

      setReactionGifs([])

      setReactionSearch("")


    } catch (error) {

      console.log(
        "Send GIF Error:",
        error
      )

      toast.error(
        "Failed to send GIF"
      )

    }

  }


  // ---------------- CLOSE GIF RESULTS ----------------

  const closeGifResults = () => {

    setReactionGifs([])

    setReactionSearch("")

    setSelectedGif(null)

  }


  return selectedUser ? (

    <div className='h-full overflow-scroll relative backdrop-blur-lg'>


      {/* HEADER */}

      <div className='flex items-center gap-3 py-3 mx-4 border-b border-stone-500'>

        <img
          src={
            selectedUser.profile_pic ||
            assets.avatar_icon
          }
          alt=""
          className="w-8 rounded-full"
        />


        <p className='flex-1 text-lg text-white flex items-center gap-2'>

          {selectedUser.full_name}

          {onlineUsers.includes(
            selectedUser.id.toString()
          ) && (

            <span
              className="w-2 h-2 rounded-full bg-green-500"
            ></span>

          )}

        </p>


        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt=""
          className='md:hidden max-w-7'
        />


        {/* AI REPLY */}

        <button
          onClick={getSuggestions}
          disabled={loadingSuggestions}
          className='text-xs bg-violet-500/30
          hover:bg-violet-500/50
          px-3 py-2 rounded-full
          text-violet-200
          disabled:opacity-50'
        >

          {loadingSuggestions
            ? "Thinking..."
            : "✨ AI Reply"}

        </button>


        {/* AI GIF */}

        <button
          onClick={getAIReaction}
          disabled={loadingReaction}
          className='text-xs bg-pink-500/30
          hover:bg-pink-500/50
          px-3 py-2 rounded-full
          text-pink-200
          disabled:opacity-50'
        >

          {loadingReaction
            ? "Finding..."
            : "🎭 AI GIF"}

        </button>


        <img
          src={assets.help_icon}
          alt=""
          className='max-md:hidden max-w-5'
        />

      </div>


      {/* CHAT */}

      <div
        className='flex flex-col
        h-[calc(100%-120px)]
        overflow-y-scroll
        p-3 pb-6'
      >

        {messages.map(
          (msg, index) => (

            <div
              key={index}
              className={`flex items-end gap-2 justify-end ${
                msg.sender_id !== authUser.id &&
                'flex-row-reverse'
              }`}
            >


              {/* GIF MESSAGE */}

              {msg.gif_url ? (

                <img
                  src={msg.gif_url}
                  alt="GIF"
                  className='max-w-[230px]
                  rounded-lg
                  mb-8'
                />

              ) : msg.image ? (

                /* IMAGE MESSAGE */

                <img
                  src={msg.image}
                  alt=""
                  className='max-w-[230px]
                  border border-gray-700
                  rounded-lg
                  overflow-hidden
                  mb-8'
                />

              ) : (

                /* TEXT MESSAGE */

                <p
                  className={`p-2
                  max-w-[200px]
                  md:text-sm
                  font-light
                  rounded-lg
                  mb-8
                  break-all
                  bg-violet-500/30
                  text-white
                  ${
                    msg.sender_id === authUser.id
                      ? 'rounded-br-none'
                      : 'rounded-bl-none'
                  }`}
                >

                  {msg.text}

                </p>

              )}


              {/* PROFILE + TIME */}

              <div className='text-center text-xs'>

                <img
                  src={
                    msg.sender_id === authUser.id
                      ? authUser?.profile_pic ||
                        assets.avatar_icon
                      : selectedUser?.profile_pic ||
                        assets.avatar_icon
                  }
                  alt=""
                  className='w-7 rounded-full'
                />

                <p className='text-gray-500'>

                  {formatMessageTime(
                    msg.created_at
                  )}

                </p>

              </div>

            </div>

          )
        )}


        <div ref={scrollEnd}></div>

      </div>


      {/* ================= BOTTOM ================= */}

      <div
        className='absolute
        bottom-0
        left-0
        right-0'
      >


        {/* AI GIF RESULTS */}

        {reactionGifs.length > 0 && (

          <div className='px-3 pb-2'>

            <div
              className='bg-[#282142]
              border border-pink-500/30
              rounded-xl p-3'
            >


              {/* HEADER */}

              <div
                className='flex
                items-center
                justify-between
                mb-3'
              >

                <div>

                  <p className='text-xs text-pink-300'>

                    🎭 AI GIF Reactions

                  </p>

                  {reactionSearch && (

                    <p
                      className='text-[10px]
                      text-gray-500
                      mt-1'
                    >

                      {reactionSearch}

                    </p>

                  )}

                </div>


                <button
                  onClick={closeGifResults}
                  className='text-gray-400
                  hover:text-white
                  text-xs'
                >

                  ✕

                </button>

              </div>


              {/* GIF GRID */}

              <div
                className='grid
                grid-cols-4
                gap-2
                max-h-40
                overflow-y-auto'
              >

                {reactionGifs.map(
                  (gif) => (

                    <button
                      key={gif.id}
                      onClick={() =>
                        handleSelectGif(gif)
                      }
                      className={`rounded-lg
                      overflow-hidden
                      transition
                      ${
                        selectedGif?.id === gif.id
                          ? 'ring-2 ring-pink-400'
                          : 'hover:ring-2 hover:ring-pink-400'
                      }`}
                    >

                      <img
                        src={
                          gif.images
                            .fixed_width_small
                            .url
                        }
                        alt={
                          gif.title ||
                          "GIF reaction"
                        }
                        className='w-full
                        h-20
                        object-cover'
                      />

                    </button>

                  )
                )}

              </div>


              {/* SELECTED GIF */}

              {selectedGif && (

                <div
                  className='mt-3
                  flex
                  items-center
                  justify-between
                  bg-white/5
                  rounded-lg
                  p-2'
                >

                  <div
                    className='flex
                    items-center
                    gap-2'
                  >

                    <img
                      src={
                        selectedGif.images
                          .fixed_width_small
                          .url
                      }
                      alt=""
                      className='w-12
                      h-12
                      object-cover
                      rounded'
                    />

                    <p className='text-xs text-gray-300'>

                      GIF selected

                    </p>

                  </div>


                  <button
                    onClick={handleSendGif}
                    className='text-xs
                    bg-pink-500
                    hover:bg-pink-600
                    text-white
                    px-3
                    py-2
                    rounded-full'
                  >

                    Send GIF

                  </button>

                </div>

              )}


              {/* ATTRIBUTION */}

              <p
                className='text-[10px]
                text-gray-500
                text-right
                mt-2'
              >

                Powered by GIPHY

              </p>

            </div>

          </div>

        )}


        {/* AI SUGGESTIONS */}

        {suggestions.length > 0 && (

          <div className='px-3 pb-2'>

            <div
              className='bg-[#282142]
              border border-violet-500/30
              rounded-xl p-3'
            >

              <p
                className='text-xs
                text-violet-300
                mb-2'
              >

                ✨ AI Suggestions

              </p>


              <div className='flex flex-wrap gap-2'>

                {suggestions.map(
                  (suggestion, index) => (

                    <button
                      key={index}
                      onClick={() =>
                        selectSuggestion(
                          suggestion
                        )
                      }
                      className='text-sm
                      text-gray-200
                      bg-white/10
                      hover:bg-violet-500/30
                      px-3
                      py-2
                      rounded-lg'
                    >

                      {suggestion}

                    </button>

                  )
                )}

              </div>

            </div>

          </div>

        )}


        {/* INPUT */}

        <div
          className='flex
          items-center
          gap-3
          p-3'
        >

          <div
            className='flex-1
            flex
            items-center
            bg-gray-100/12
            px-3
            rounded-full'
          >

            <input
              onChange={(e) =>
                setInput(e.target.value)
              }
              value={input}
              onKeyDown={(e) =>
                e.key === "Enter"
                  ? handleSendMessage(e)
                  : null
              }
              type="text"
              placeholder="Send a message"
              className='flex-1
              text-sm
              p-3
              border-none
              rounded-lg
              outline-none
              text-white
              placeholder-gray-400'
            />


            <input
              onChange={handleSendImage}
              type="file"
              id='image'
              accept="image/png , image/jpeg"
              hidden
            />


            <label htmlFor="image">

              <img
                src={assets.gallery_icon}
                alt=""
                className='w-5
                mr-2
                cursor-pointer'
              />

            </label>

          </div>


          <img
            onClick={handleSendMessage}
            src={assets.send_button}
            alt=""
            className='w-7
            cursor-pointer'
          />

        </div>

      </div>

    </div>

  ) : (

    <div
      className='flex
      flex-col
      items-center
      justify-center
      gap-2
      text-gray-500
      bg-white/10
      max-md:hidden'
    >

      <img
        src={assets.logo_icon}
        className='max-w-16'
        alt=""
      />

      <p
        className='text-lg
        font-medium
        text-white'
      >

        Chat anytime, anywhere

      </p>

    </div>

  )
}

export default ChatContainer