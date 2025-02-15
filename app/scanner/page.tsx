"use client";

import React, { useRef, useState } from "react";
import Tesseract from "tesseract.js";

const CameraOCR = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  // Start Camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  // Capture Frame and Process OCR
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      // Convert canvas to image data
      canvas.toBlob((blob) => {
        if (blob) processImage(blob);
      }, "image/png");
    }
  };

  // Process Image with Tesseract.js
  const processImage = (image) => {
    setLoading(true);
    Tesseract.recognize(image, "eng", {
      logger: (m) => console.log(m), // Logs progress
    })
      .then(({ data: { text } }) => {
        setText(text);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  return (
    <div className="p-4">
      <button
        onClick={startCamera}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Start Camera
      </button>

      <div className="mt-4">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full max-w-md"
        />
      </div>

      <canvas ref={canvasRef} width={640} height={480} className="hidden" />

      <button
        onClick={captureImage}
        className="mt-2 px-4 py-2 bg-green-500 text-white rounded"
      >
        Capture & Scan
      </button>

      {loading ? (
        <p className="mt-2">Processing...</p>
      ) : (
        <p className="mt-2">{text}</p>
      )}
    </div>
  );
};

export default CameraOCR;
