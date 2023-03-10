import React, { useState, useEffect } from "react";
import WriteNewSnippet from "../modules/WriteNewSnippet";
import ModalBackground from "../modules/ModalBackground";
import "../../utilities.css";
import "./Feed.css";
import { get, post } from "../../utilities";
import leaf from "../../public/leaf.svg";
import "./Profile.css";
import SnippetDisplay from "../modules/SnippetDisplay";
import { getRandomPlaceholder } from "../../utils/snippet.utils";

const ROOT = "63d04ff67f9ad37d137f7750";
const MAX_SNIPPETS_PER_PAGE = 10;

const WriteNewSnippetButton = ({ onClick }) => {
  return (
    <div
      className="FeedWriteNewSnippetButton-container u-flex-justifyCenter u-flex-alignCenter u-grow u-clickable"
      onClick={onClick}
    >
      <img className="FeedWriteNewSnippetButton-icon" src={leaf}></img>
    </div>
  );
};

const Feed = ({ userName, viewer, goTo, popupHandlers }) => {
  const [snippets, setSnippets] = useState(undefined);
  const [authorToPic, setAuthorToPic] = useState(undefined);
  const [fetchAgain, setFetchAgain] = useState(false); //dummy state to trigger useEffect hook on new post

  useEffect(() => {
    const queryDB = async () => {
      const res = await get("/api/snippets", { userId: viewer._id });
      setSnippets(res);
      let authorIds = [];
      for (const { tabName, tabData } of res) {
        for (const snippet of tabData) authorIds.push(snippet.authorId);
      }
      console.log("getting snippets, authorIds are: ");
      console.log(new Set(authorIds));
      setAuthorToPic(await get("/api/profile-pictures", { userIds: authorIds }));
    };
    queryDB();
  }, [fetchAgain]);

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
        }).then(() => {
          setFetchAgain((s) => !s);
        });
    };
    writeToDB();
  };

  const toggleSnippetWriter = () => {
    //setWriter((s) => !s);
    const placeholder = getRandomPlaceholder("new");
    popupHandlers.toggle("writer");
    popupHandlers.setWriteHandler((input) => {
      addPost(input);
    });
    popupHandlers.setWriterPlaceholder(placeholder);
  };
  return (
    <>
      <div className="BackgroundImage"></div>
      <div className="Feed-container u-flex-justifyCenter">
        <div className="Feed-snippetDisplayWrapper">
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
            <div className="Loading"></div>
          )}
        </div>
        {viewer._id && <WriteNewSnippetButton onClick={toggleSnippetWriter} />}
      </div>
    </>
  );
};

export default Feed;
