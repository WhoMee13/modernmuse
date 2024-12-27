import React, { useEffect, useState } from "react";
import "../../css/Profile.scss";
import { useAuth } from "../../contexts/authContext";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const Profile = () => {
  const { value } = useAuth();
  const [user, setUser] = useState({});
  const [bellySize, setBellySize] = useState(30);
  const [chestSize, setChestSize] = useState(35);
  const [weight, setWeight] = useState(150);
  const [height, setHeight] = useState(170);
  const [size, setSize] = useState("");
  const [fitPreference, setFitPreference] = useState("regular");

  const fetchData = async () => {
    try {
      const response = await fetch("/api/user/profile", {
        method: "get",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${value.token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const calculateSize = () => {
    let baseSize = "";

    if (height < 160 && weight < 120 && chestSize <= 35 && bellySize <= 30) {
      baseSize = "XS";
    } else if (height < 170 && weight < 150 && chestSize <= 39 && bellySize <= 35) {
      baseSize = "S";
    } else if (height < 180 && weight < 180 && chestSize <= 42 && bellySize <= 40) {
      baseSize = "M";
    } else if (height < 190 && weight < 210 && chestSize <= 45 && bellySize <= 45) {
      baseSize = "L";
    } else {
      baseSize = "XL";
    }

    // Adjust size based on fit preference
    if (fitPreference === "tight" && baseSize !== "XS") {
      baseSize = String.fromCharCode(baseSize.charCodeAt(0) - 1); // Go one size smaller
    } else if (fitPreference === "loose" && baseSize !== "XL") {
      baseSize = String.fromCharCode(baseSize.charCodeAt(0) + 1); // Go one size larger
    }

    setSize(baseSize);
    // updateSize("clothing", baseSize);
  };

  // const updateSize = async (type, size) => {
  //   try {
  //     const response = await fetch(`/api/user/${type}/${size}`, {
  //       method: "PUT",
  //       headers: {
  //         "Content-Type": "application/json",
  //         authorization: `Bearer ${value.token}`,
  //       },
  //     });
  //     const data = await response.json();
  //     if (!data.success) {
  //       throw new Error(data.message);
  //     }
  //     alert(`${type.charAt(0).toUpperCase() + type.slice(1)} size updated successfully!`);
  //     fetchData();
  //   } catch (error) {
  //     console.error(`Error updating ${type} size:`, error);
  //     alert(`Failed to update ${type} size.`);
  //   }
  // };

  // const calculateSize = () => {
  //   let heightVal = 0;
  //   let weightVal = 0;
  //   let bellyVal = 0;
  //   let chestVal = 0;
  //   let preferVal = 0;

  //   if (height < 169) heightVal = 1;
  //   else if (height < 175) heightVal = 2;
  //   else if (height < 180) heightVal = 3;
  //   else if (height < 185) heightVal = 4;
  //   else heightVal = 5;

  //   if (weight < 150) weightVal = 1;
  //   else if (weight < 170) weightVal = 2;
  //   else weightVal = 3;

  //   if (bellySize === 30) bellyVal = 1;
  //   else if (bellySize === 35) bellyVal = 2;
  //   else bellyVal = 3;

  //   if (chestSize === 35) chestVal = 1;
  //   else if (chestSize === 39) chestVal = 2;
  //   else chestVal = 3;

  //   if (fitPreference === "tight") preferVal = 1;
  //   else if (fitPreference === "regular") preferVal = 2;
  //   else preferVal = 3;

  //   const totalVal = heightVal + weightVal + bellyVal + chestVal + preferVal;

  //   if (totalVal < 8) setSize("xsmall");
  //   else if (totalVal < 15) setSize("small");
  //   else if (totalVal < 18) setSize("medium");
  //   else if (totalVal < 20) setSize("large");
  //   else setSize("xlarge");
  // };

  const formatHeight = (cm) => {
    const feet = Math.floor(cm / 30.48);
    const inches = Math.round((cm % 30.48) / 2.54);
    return `${feet}' ${inches}"`;
  };

  const formatWeight = (lbs) => {
    const kg = Math.round((lbs / 2.20462) * 10) / 10;
    return `${lbs} lbs (${kg} kg)`;
  };

  return (
    <>
      <Navbar />
      <div className="profile-container">
        <div className="profile-card">
          <h1>My Profile</h1>
          <div className="profile-card__content">
            <h3 className="profile-card__name_small">@{user.userName}</h3>
            <span>Email: {user.email}</span>
            <span>Contact No.: {user.contact}</span>
            <span>Address: {user.address}</span>

            {/* <div className="size-calculator"> */}

            <div className="size-inputs">
              <label htmlFor="height-slider">Height:</label>
              <input
                type="range"
                id="height-slider"
                min="145"
                max="222"
                step="1"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
              />
              <div>{`Height: ${height} cm (${formatHeight(height)})`}</div>
            </div>

            <div className="size-inputs">
              <label htmlFor="weight-slider">Weight:</label>
              <input
                type="range"
                id="weight-slider"
                min="90"
                max="300"
                step="1"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
              />
              <div>{`Weight: ${formatWeight(weight)}`}</div>
            </div>

            <div className="size-inputs">
              <label htmlFor="belly-size">Belly Size:</label>
              <select
                id="belly-size"
                value={bellySize}
                onChange={(e) => setBellySize(Number(e.target.value))}
              >
                <option value="30">Flat</option>
                <option value="35">Average</option>
                <option value="40">Round</option>
              </select>
            </div>

            <div className="size-inputs">
              <label htmlFor="chest-size">Chest Size:</label>
              <select
                id="chest-size"
                value={chestSize}
                onChange={(e) => setChestSize(Number(e.target.value))}
              >
                <option value="35">Slim</option>
                <option value="39">Average</option>
                <option value="42">Broad</option>
              </select>
            </div>

            <div className="size-inputs">
              <label htmlFor="fit-preference">Fit Preference:</label>
              <select
                id="fit-preference"
                value={fitPreference}
                onChange={(e) => setFitPreference(e.target.value)}
              >
                <option value="tight">Tight</option>
                <option value="regular">Regular</option>
                <option value="loose">Loose</option>
              </select>
            </div>

            <div className="size-inputs">
              <button onClick={calculateSize}>Calculate Size</button>
              {size && <p>Your ideal size is: {size}</p>}
            </div>
            {/* </div> */}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;