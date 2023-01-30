import React, { useState, useEffect } from "react";
import WriteNewSnippet from "../modules/WriteNewSnippet";
import ModalBackground from "../modules/ModalBackground";
import "../../utilities.css";
import "./Feed.css";
import { get, post } from "../../utilities";
import leaf from "../../public/leaf.svg";
import "./Profile.css";
import SnippetDisplay from "../modules/SnippetDisplay";

const ROOT = "63d04ff67f9ad37d137f7750";
const MAX_SNIPPETS_PER_PAGE = 6;

const WriteNewSnippetButton = ({ onClick }) => {
  return (
    <div
      className="FeedWriteNewSnippetButton-container u-flex-justifyCenter u-flex-alignCenter"
      onClick={onClick}
    >
      <img className="FeedWriteNewSnippetButton-icon" src={leaf}></img>
    </div>
  );
};

const Feed = ({ userName, viewer, goTo, popupHandlers }) => {
  const [snippets, setSnippets] = useState(undefined);
  const [authorToPic, setAuthorToPic] = useState(undefined);

  useEffect(() => {
    const queryDB = async () => {
      const res = await get("/api/snippets", { userId: viewer._id });
      setSnippets(res);
      let authorIds = [];
      for (const { tabName, tabData } of res) {
        for (const snippet of tabData) authorIds.push(snippet.authorId);
      }
      setAuthorToPic(await get("/api/profile-pictures", { userIds: authorIds }));
    };
    queryDB();
  }, []);

  const addPost = (input) => {
    const writeToDB = async () => {
      const treeId = await post("/api/new-tree");
      console.log("browser got treeId: " + treeId);
      if (treeId)
        post("/api/new-snippet", {
          authorName: viewer.name,
          authorId: viewer._id,
          input: input,
          parentId: ROOT,
          treeId: treeId,
        });
    };
    writeToDB();
  };

  const toggleSnippetWriter = () => {
    //setWriter((s) => !s);
    popupHandlers.toggle("writer");
    popupHandlers.setWriteHandler((input) => {
      addPost(input);
    });
  };
  return (
    <div className="Feed-container">
      <h1>To Upload Image on mongoDB</h1>
      
     <div>
        <form action="/" method="POST" enctype="multipart/form-data">
            <div>
                <label for="name">Image Title</label>
                <input type="text" id="name" placeholder="Name"
                        name="name" required/>
            </div>

            <div>
                <label for="desc">Image Description</label>
                <textarea id="desc" name="desc"  rows="2"
                          placeholder="Description" required>
                </textarea>
            </div>

            <div>
                <label for="image">Upload Image</label>
                <input type="file" id="image"
                       name="image" required/>
            </div>
            <div>
                <button type="submit">Submit</button>
            </div>
        </form>

      </div>

      


      <div className="Feed-snippets">
        {snippets && authorToPic ? (
          <SnippetDisplay
            viewer={viewer}
            goTo={goTo}
            snippets={snippets}
            authorToPic={authorToPic}
            maxPerPage={MAX_SNIPPETS_PER_PAGE}
            popupHandlers={popupHandlers}
          />
        ) : (
          <div className="Loading">Loading...</div>
        )}
      </div>
      {viewer._id && <WriteNewSnippetButton onClick={toggleSnippetWriter} />}
    </div>
  );
};

export default Feed;
