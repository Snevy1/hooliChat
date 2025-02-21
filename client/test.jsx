const renderDocumentPreview = (fileUrl) => {
    const fileName = fileUrl.split("/").pop();
    const fileExtension = fileUrl.toLowerCase().split(".").pop();
    const isPDF = fileExtension === "pdf";
    const isDoc = ["doc", "docx"].includes(fileExtension);
    const isPpt = ["ppt", "pptx"].includes(fileExtension);

    return (
      <div className="w-full min-w-[80%] max-w-[90%] mx-auto flex flex-col items-center gap-2 p-2 sm:p-4 border rounded-lg shadow-md bg-white">
        <span className="text-sm font-semibold text-gray-700 text-center break-words w-full px-2">
          {fileName}
        </span>

        {isPDF ? (
          <div className="w-full max-w-[300px] overflow-hidden">
            <Document file={`${HOST}/${fileUrl}`} onLoadError={console.error}>
              <Page pageNumber={1} width={300} className="w-full [&>canvas]:w-full! [&>canvas]:h-auto!" />
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

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2 w-full px-2">
          <button
            className="bg-green-500 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 hover:bg-green-600 transition-all duration-300 w-full sm:w-auto"
            onClick={() => window.open(`${HOST}/${fileUrl}`, "_blank")}
          >
            <AiFillEye /> View
          </button>

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