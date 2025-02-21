import { apiClient } from "@/lib/api-client";
import { useAppStore } from "@/store";
import { GET_ALL_MESSAGES_ROUTE, GET_CHANNEL_MESSAGES, HOST } from "@/utils/constants";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { MdFolderZip } from "react-icons/md";
import { IoMdArrowRoundDown } from "react-icons/io";
import { IoCloseSharp } from "react-icons/io5";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getColor } from "@/lib/utils";
import { Document, Page, pdfjs } from "react-pdf";
import { AiFillEye } from "react-icons/ai";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Import the worker from pdfjs-dist
import { PDFWorker } from "pdfjs-dist";

// Set up PDF worker locally
pdfjs.GlobalWorkerOptions.workerSrc = URL.createObjectURL(
  new Blob([PDFWorker], { type: "application/javascript" })
);

const MessageContainer = () => {
  const scrollRef = useRef();

  const {
    selectedChatType,
    selectedChatData,
    userInfo,
    selectedChatMessages,
    setSelectedChatMessages,
    setFileDownloadProgress,
    setIsDownloading,
  } = useAppStore();

  const [showImage, setShowImage] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const getMessages = async () => {
      try {
        const response = await apiClient.post(
          GET_ALL_MESSAGES_ROUTE,
          {
            id: selectedChatData._id,
          },
          {
            withCredentials: true,
          }
        );

        if (response.data.messages) {
          setSelectedChatMessages(response.data.messages);
        }
      } catch (error) {
        console.log({ error });
      }
    };

    const getChannelMessages = async () => {
      try {
        const response = await apiClient.get(`${GET_CHANNEL_MESSAGES}/${selectedChatData._id}`, {
          withCredentials: true,
        });

        if (response.data.messages) {
          setSelectedChatMessages(response.data.messages);
        }
      } catch (error) {
        console.log({ error });
      }
    };

    if (selectedChatData._id) {
      if (selectedChatType === "contact") getMessages();
      else if (selectedChatType === "channel") getChannelMessages();
    }
  }, [selectedChatData, selectedChatType, setSelectedChatMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [selectedChatMessages]);

  const checkIfImage = (filePath) => {
    const imageRegex = /\.(jpg|jpeg|png|gif|bmp|tiff|tif|webp|svg|ico|heic|heif)$/i;
    return imageRegex.test(filePath);
  };

  const checkIfDocument = (filePath) => {
    const documentRegex = /\.(pdf|ppt|pptx)$/i;
    return documentRegex.test(filePath);
  };

  const downloadFile = async (url) => {
    setIsDownloading(true);
    setFileDownloadProgress(0);

    const response = await apiClient.get(`${HOST}/${url}`, {
      responseType: "blob",
      onDownloadProgress: (progressEvent) => {
        const { loaded, total } = progressEvent;
        const percentCompleted = Math.round((loaded * 100) / total);
        setFileDownloadProgress(percentCompleted);
      },
    });

    const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = urlBlob;
    link.setAttribute("download", url.split("/").pop());
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(urlBlob);
    setIsDownloading(false);
    setFileDownloadProgress(0);
  };

  const renderDocumentPreview = (fileUrl) => {
    const fileName = fileUrl.split("/").pop(); // Extract filename
    const fileExtension = fileUrl.toLowerCase().split(".").pop(); // Get file extension
    const isPDF = fileExtension === "pdf";
    const isDoc = ["doc", "docx"].includes(fileExtension);
    const isPpt = ["ppt", "pptx"].includes(fileExtension);

    return (
      <div className="w-full min-w-[90%] max-w-[90%] mx-auto flex flex-col items-center gap-2 p-2 sm:p-4 border rounded-lg shadow-md bg-white">
        {/* File Name */}
        <span className="text-sm font-semibold text-gray-700 text-center break-words w-full px-2">
          {fileName}
        </span>

        {/* Preview for documents */}
        {isPDF ? (
          <div className="w-full max-w-[300px] overflow-hidden">
            <Document file={`${HOST}/${fileUrl}`} onLoadError={console.error}>
              <Page 
                pageNumber={1} 
                width={300}
                className="w-full [&>canvas]:w-full! [&>canvas]:h-auto!"
              />
            </Document>
          </div>
        ) : isDoc ? (
          <iframe 
            src={`https://docs.google.com/gview?url=${encodeURIComponent(`${HOST}/${fileUrl}`)}&embedded=true`}
            className="w-full h-48 sm:h-64 border rounded"
            frameBorder="0"
          />
        ) : isPpt ? (
          <iframe 
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(`${HOST}/${fileUrl}`)}`}
            className="w-full h-48 sm:h-64 border rounded"
            frameBorder="0"
          />
        ) : (
          <p className="text-gray-500 text-center text-sm p-2">
            Preview not available for this file type.
          </p>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2 w-full px-2">
          {/* View Button */}
          <button
            className="bg-green-500 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 hover:bg-green-600 transition-all duration-300 w-full sm:w-auto"
            onClick={() => window.open(`${HOST}/${fileUrl}`, "_blank")}
          >
            <AiFillEye /> View
          </button>
          
          {/* Download Button */}
          <button
            className="bg-blue-500 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 hover:bg-blue-600 transition-all duration-300 w-full sm:w-auto"
            onClick={() => downloadFile(fileUrl)}
          >
            <IoMdArrowRoundDown /> Download
          </button>
        </div>
      </div>
    );
  };

  const renderDMMessages = (message) => (
    <div className={`${message.sender === selectedChatData._id ? "text-left" : "text-right"}`}>
      {message.messageType === "text" && (
        <div
          className={`${
            message.sender !== selectedChatData._id
              ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
              : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"
          } border inline-block p-4 rounded my-2 max-w-[50%] break-words ml-9`}
        >
          {message.content}
        </div>
      )}
      {message.messageType === "file" && (
        <div
          className={`${
            message.sender !== selectedChatData._id
              ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
              : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"
          } border inline-block p-4 rounded my-2 w-[90%] break-words`}
        >
          {checkIfImage(message.fileUrl) ? (
            <div
              className="cursor-pointer"
              onClick={() => {
                setShowImage(true);
                setImageUrl(message.fileUrl);
              }}
            >
              <img src={`${HOST}/${message.fileUrl}`} height={300} width={300} />
            </div>
          ) : checkIfDocument(message.fileUrl) ? (
            renderDocumentPreview(message.fileUrl)
          ) : (
            <div className="flex items-center justify-center gap-4">
              <span className="text-white/80 text-3xl bg-black/20 rounded-full p-3">
                <MdFolderZip />
              </span>
              <span>{message.fileUrl.split("/").pop()}</span>
              <span
                className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
                onClick={() => downloadFile(message.fileUrl)}
              >
                <IoMdArrowRoundDown />
              </span>
            </div>
          )}
        </div>
      )}
      <div className="text-xs text-gray-600">
        {moment(message.timestamp).format("LT")}
      </div>
    </div>
  );

  const renderChannelMessages = (message) => (
    <div className={`mt-5 ${message.sender._id !== userInfo.id ? "text-left" : "text-right"}`}>
      {message.messageType === "text" && (
        <div
          className={`${
            message.sender._id !== userInfo.id
              ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
              : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"
          } border inline-block p-4 rounded my-2 max-w-[50%] break-words`}
        >
          {message.content}
        </div>
      )}
      {message.messageType === "file" && (
        <div
          className={`${
            message.sender._id === userInfo._id
              ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
              : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"
          } border inline-block p-4 rounded my-2 w-[90%] break-words`}
        >
          {checkIfImage(message.fileUrl) ? (
            <div
              className="cursor-pointer"
              onClick={() => {
                setShowImage(true);
                setImageUrl(message.fileUrl);
              }}
            >
              <img src={`${HOST}/${message.fileUrl}`} height={300} width={300} />
            </div>
          ) : checkIfDocument(message.fileUrl) ? (
            renderDocumentPreview(message.fileUrl)
          ) : (
            <div className="flex items-center justify-center gap-4">
              <span className="text-white/80 text-3xl bg-black/20 rounded-full p-3">
                <MdFolderZip />
              </span>
              <span>{message.fileUrl.split("/").pop()}</span>
              <span
                className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
                onClick={() => downloadFile(message.fileUrl)}
              >
                <IoMdArrowRoundDown />
              </span>
            </div>
          )}
        </div>
      )}
      {message.sender._id !== userInfo.id ? (
        <div className="flex items-center justify-start gap-3">
          <Avatar className="h-8 w-8 rounded-full overflow-hidden">
            {message.sender.image && (
              <AvatarImage
                src={`${HOST}/${message.sender.image}`}
                alt="profile"
                className="object-cover w-full h-full bg-black"
              />
            )}
            <AvatarFallback
              className={`uppercase h-8 w-8 text-lg flex items-center justify-center rounded-full ${getColor(
                message.sender.color
              )}`}
            >
              {message.sender.firstName
                ? message.sender.firstName.split("").shift()
                : message.sender.email.split("")}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-white/60">
            {`${message.sender.firstName} ${message.sender.lastName}`}
          </span>
          <span className="text-xs text-white/60">
            {moment(message.timestamp).format("LT")}
          </span>
        </div>
      ) : (
        <div className="text-xs text-white/60 mt-1">
          {moment(message.timestamp).format("LT")}
        </div>
      )}
    </div>
  );

  const renderMessages = () => {
    let lastDate = null;
    return selectedChatMessages.map((message, index) => {
      const messageDate = moment(message.timestamp).format("YYYY-MM-DD");
      const showDate = messageDate !== lastDate;
      lastDate = messageDate;

      return (
        <div key={index}>
          {showDate && (
            <div className="text-center text-gray-500 my-2">
              {moment(message.timestamp).format("LL")}
            </div>
          )}
          {selectedChatType === "contact" && renderDMMessages(message)}
          {selectedChatType === "channel" && renderChannelMessages(message)}
        </div>
      );
    });
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hidden p-4 px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full">
      {renderMessages()}
      <div ref={scrollRef} />
      {showImage && (
        <div className="fixed z-[1000] top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center backdrop-blur-lg">
          <div>
            <img src={`${HOST}/${imageUrl}`} className="h-[80vh] w-full bg-cover" />
          </div>
          <div className="flex gap-5 fixed top-0 mt-5">
            <button
              className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
              onClick={() => downloadFile(imageUrl)}
            >
              <IoMdArrowRoundDown />
            </button>
            <button
              className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
              onClick={() => {
                setShowImage(false);
                setImageUrl(null);
              }}
            >
              <IoCloseSharp />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageContainer;
