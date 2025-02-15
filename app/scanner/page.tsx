"use client";

import { AppBar, Button, Menu, Toolbar } from "@mui/material";
import React, { useRef, useState } from "react";
import Tesseract from "tesseract.js";

const CameraOCR = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  // Start Camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop()); // Stop each track
      videoRef.current.srcObject = null;
    }
  };

  // Capture Frame and Process OCR
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      }

      // Convert canvas to image data
      canvas.toBlob((blob) => {
        if (blob) processImage(blob);
      }, "image/png");
    }
  };

  // Process Image with Tesseract.js
  const processImage = (image: Tesseract.ImageLike) => {
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
    <>
      <div className="flex justify-center items-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full max-w-md"
        />
      </div>
      <canvas ref={canvasRef} width={640} height={480} className="hidden" />

      <div className="flex justify-center items-start">
        {loading ? (
          <p className="mt-2">Processing...</p>
        ) : (
          <p className="mt-2">{text}</p>
        )}
      </div>

      <AppBar
        position="fixed"
        sx={{
          top: "auto",
          bottom: 0,
        }}
      >
        <Toolbar disableGutters className="flex justify-evenly">
          <Button variant="contained" onClick={startCamera} color="success">
            Start Camera
          </Button>

          <Button variant="contained" onClick={stopCamera} color="error">
            Stop Camera
          </Button>
          <Button variant="contained" onClick={captureImage} color="secondary">
            Capture & Scan
          </Button>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default CameraOCR;
