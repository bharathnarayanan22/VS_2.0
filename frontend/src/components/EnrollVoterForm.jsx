import React, { useState, useRef } from "react";
import { styled, ThemeProvider, createTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import Webcam from "react-webcam";
import axios from "axios";

// Define custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#ff9933",
    },
    secondary: {
      main: "#138808",
    },
  },
});

const EnrollVoterForm = () => {
  const webcamRef = useRef(null);
  const [name, setName] = useState("");
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);

  const captureImages = async () => {
    const capturedPhotos = [];
    for (let i = 0; i < 20; i++) {
      const imageSrc = webcamRef.current.getScreenshot();
      capturedPhotos.push(imageSrc);
      await new Promise((resolve) => setTimeout(resolve, 500)); // Delay to capture images at intervals
    }
    setPhotos(capturedPhotos);
  };

  const handleEnroll = async () => {
    try {
      setLoading(true);
      const response = await axios.post("http://127.0.0.1:5000/capture", {
        name: name,
        image: photos.map((photo) => photo.split(",")[1]), // Send base64 parts only
      });
      

      alert("Voter enrolled successfully!");
    } catch (error) {
      console.error("Error enrolling voter:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Enroll Voter
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Name"
              variant="outlined"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Grid>
        </Grid>
        <Box mt={2}>
          <Typography variant="h6" gutterBottom>
            Capture Photo
          </Typography>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={640}
            height={480}
          />
          <Grid container spacing={2} mt={2}>
            {photos.map((photo, index) => (
              <Grid item xs={6} sm={3} key={index}>
                <img
                  src={photo}
                  alt={`Photo ${index}`}
                  style={{ width: "100%", borderRadius: "5px" }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
        <Box mt={2} display="flex" justifyContent="space-between">
          <Button
            variant="contained"
            color="primary"
            onClick={captureImages}
            startIcon={<PhotoCameraIcon />}
            disabled={loading}
          >
            Capture Images
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleEnroll}
            disabled={loading || photos.length < 20}
          >
            {loading ? "Enrolling..." : "Enroll Voter"}
          </Button>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default EnrollVoterForm;
