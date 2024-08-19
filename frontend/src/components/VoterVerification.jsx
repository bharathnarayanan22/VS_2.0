// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Webcam from 'react-webcam';
// import styles from './VoterVerification.module.css';
// import loadingSpinner from './loading-spinner.gif';
// import axios from 'axios';

// const VoterVerification = () => {
//   const navigate = useNavigate();
//   const [result, setResult] = useState('');
//   const [loading, setLoading] = useState(false);
//   const webcamRef = React.useRef(null);



//   const verifyUser = async () => {
//     const imageSrc = webcamRef.current.getScreenshot();
//     if (imageSrc) {

//       try {
//         const response = await axios.post('http://127.0.0.1:5000/recognize', {
//           image: imageSrc.split(',')[1],  
//         });
//         console.log(response.data)

//         if (!response) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         console.log('Server response:', response.data);
//         displayResult(response.data);
//       } catch (error) {
//         console.error('Error sending snapshot:', error);
//       }
//     }
//   };


//   const displayResult = (data) => {
//     if (data.error) {
//       setResult(data.error);
//     } else if (data.message === "Already voted") {
//       setResult("You have already voted.");
//       alert("You have already voted.");  // Show an alert to the user
//     } else {
//       setResult(`Detected face: ${data.name}`);
//       navigate('/voter');  // Redirect to the voter page after successful verification
//     }
//     setLoading(false);
//   };
    

//   const handleDetectUser = (event) => {
//     event.preventDefault();
//     verifyUser();
//   };

//   return (
//     <div className={styles.container}>
//       <div className={styles.leftPanel}></div>
//       <div className={styles.rightPanel}>
//         <h1 className={styles.heading}>Verification Page</h1>

//         <Webcam
//           audio={false}
//           ref={webcamRef}
//           screenshotFormat="image/jpeg"
//           className={styles.video}
//         />
//         <form className={styles.form} onSubmit={handleDetectUser}>
//           <button className={styles.button} type="submit" disabled={loading}>
//             Verify
//           </button>
//         </form>
//         {loading && (
//           <div className={styles.loadingOverlay}>
//             <img src={loadingSpinner} alt="Loading..." className={styles.loadingSpinner} />
//           </div>
//         )}
//         <p className={styles.result}>{result}</p>
//       </div>
//     </div>
//   );
// };

// export default VoterVerification;


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import axios from 'axios';
import styles from './VoterVerification.module.css';
import loadingSpinner from './loading-spinner.gif';

const VoterVerification = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [otp, setOtp] = useState('');
  const [mobileNumber, setMobileNumber] = useState(''); 
  const webcamRef = React.useRef(null);

  const verifyUser = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setLoading(true);
      try {
        const response = await axios.post('http://127.0.0.1:5000/recognize', {
          image: imageSrc.split(',')[1],
        });

        if (response.data.error) {
          throw new Error(response.data.error);
        }

        if (response.data.name) {
          setMobileNumber(response.data.mobileNumber);
          sendOtp(response.data.mobileNumber);
        }

      } catch (error) {
        console.error('Error verifying user:', error);
        setResult('Error verifying user. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const sendOtp = async (mobile) => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/send-otp', { mobile });
      if (response.data.success) {
        setShowOtpPopup(true); 
        setResult('OTP sent to your mobile number.');
      } else {
        setResult('Failed to send OTP.');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setResult('Error sending OTP. Please try again.');
    }
  };

  const verifyOtp = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/verify-otp', { mobile: mobileNumber, otp });
      if (response.data.success) {
        navigate('/voter'); 
      } else {
        setResult('Incorrect OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setResult('Error verifying OTP. Please try again.');
    }
  };

  const handleDetectUser = (event) => {
    event.preventDefault();
    verifyUser();
  };

  const handleOtpSubmit = (event) => {
    event.preventDefault();
    verifyOtp();
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}></div>
      <div className={styles.rightPanel}>
        <h1 className={styles.heading}>Verification Page</h1>

        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className={styles.video}
        />
        <form className={styles.form} onSubmit={handleDetectUser}>
          <button className={styles.button} type="submit" disabled={loading}>
            Verify
          </button>
        </form>
        {loading && (
          <div className={styles.loadingOverlay}>
            <img src={loadingSpinner} alt="Loading..." className={styles.loadingSpinner} />
          </div>
        )}
        <p className={styles.result}>{result}</p>

        {showOtpPopup && (
          <div className={styles.otpPopup}>
            <h2>Enter OTP</h2>
            <form onSubmit={handleOtpSubmit}>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                required
              />
              <button type="submit">Submit</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoterVerification;
