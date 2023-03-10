import React from "react";
import { useState, useEffect } from "react";
import "./WriteNewSnippet.css";

const INITIAL_TEXTBOX_HEIGHT = 0.2 * window.innerHeight;
const MAX_TEXTBOX_HEIGHT = 0.6 * window.innerHeight;

/**
 * Popup for writing new snippets.
 *
 * @param {(input:String) => void} onPost function to execute when post is hit. inputs a string, the user input
 * @param {() => void} onClose function to execute to close
 * @param {String} flavortext? placeholder text
 */
const WriteNewSnippet = (props) => {
  const [input, setInput] = useState("");
  const [textbox, setTextbox] = useState(undefined);

  useEffect(() => {
    const t = document.getElementById("WriteNewSnippet-textbox");
    t.style.height = `${INITIAL_TEXTBOX_HEIGHT}px`;
    setTextbox(t);
  }, []);

  const handleInput = (e) => {
    setInput(e.target.value);
    textbox.style.height = 0;
    const newHeight = Math.min(
      Math.max(textbox.scrollHeight, INITIAL_TEXTBOX_HEIGHT),
      MAX_TEXTBOX_HEIGHT
    );
    textbox.style.height = `${newHeight}px`;
  };

  return (
    <div className="WriteNewSnippet-container u-flexColumn">
      <textarea
        id="WriteNewSnippet-textbox"
        className="WriteNewSnippet-textbox"
        onChange={handleInput}
        placeholder={props.flavortext}
      ></textarea>
      <button
        disabled={input.length === 0}
        className="WriteNewSnippet-postButton"
        onClick={() => {
          props.onPost(input);
          props.onClose();
        }}
      >
        Post
      </button>
    </div>
  );
};

export default WriteNewSnippet;
