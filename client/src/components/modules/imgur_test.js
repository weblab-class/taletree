import React from "react";
import { useState, useEffect } from "react";
import "./WriteNewSnippet.css";

const INITIAL_TEXTBOX_HEIGHT = 0.3 * window.innerHeight;
const MAX_TEXTBOX_HEIGHT = 0.6 * window.innerHeight;

/**
 *
 * @param {(input:String) => void} onPost function to execute when post is hit. inputs a string, the user input
 * @param {() => void} onClose function to execute to close
 */
const ImageForm = (props) => {

    const [img_file, setImg] = useState(undefined);
    const [img_submitted, setSubmitted] = useState(false)
    const [img_url, setUrl] =  useState("");

    const file = document.getElementById("file");
    const img = document.getElementById("img");

   useEffect(() => {
     
     const file = document.getElementById("file");
     const url = document.getElementById("url");

     setImg(file)
     setUrl(url)
   }, []);

   useEffect(() => {



   }, [img_submitted]);


  const handleInput = (ev) => {
    const formdata = new FormData()
        //setImg(ev.target.files[0])
        formdata.append("image", file)
        console.log(formdata)
        fetch("https://api.imgur.com/3/image/", {
            method: "post",
            headers: {
                Authorization: "Client-ID ad8c12362042a1b"
            },
            body: formdata
        }).then(data => data.json()).then(data => {
            img.src = data.data.link
            url.innerText = data.data.link
        })
  };

  return (
    <div>
        <img src="https://i.imgur.com/U7afLiO.png" id="img" height="200px"></img>
        <input 
        type="file"
         id="file"
         onChange={handleInput}
         ></input>
        <strong>
        <p id="url"></p>
    </strong>

    </div>
  );
};

export default ImageForm;
