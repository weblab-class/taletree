import React, { useEffect, useState } from "react";
import "./SingleSnippet.css";
import "./TreeViewSnippet.css";
import Icon from "./Icons.js";
import heart from "../../public/heart.svg";
import bookmark from "../../public/bookmark.svg";
import sprout from "../../public/sprout.svg";
import filledBookmark from "../../public/bookmark_filled.svg";
import filledHeart from "../../public/heart_filled.svg";
import "../../utilities.css";
import "../pages/Profile.css";
import { post } from "../../utilities.js";

/**
 *
 * @param {{name: String, id: String, pictureURL: String}} author
 * @param {Function} goToProfile
 */
const SingleSnippetAuthorInfo = (props) => {
  return (
    <div className="SingleSnippet-authorInfo u-flexColumn u-flex-alignCenter u-flex-justifyCenter">
      <img
        className="SingleSnippet-profilePic else"
        src={props.author.pictureURL}
        onClick={() => {
          props.goToProfile(props.author.id);
        }}
      />
      <div
        className="SingleSnippet-authorName u-bold u-clickableText else"
        onClick={() => {
          props.goToProfile(props.author.id);
        }}
      >
        {props.author.name}
      </div>
    </div>
  );
};

const SingleSnippetContentBox = ({ content }) => {
  //TODO: fade styling for overflow
  return <div>{content}</div>;
};

/**
 * Story is a component that renders creator and content of a story
 *
 * Proptypes
 * @param {String} _id of the story
 * @param {{name: String, id: String, pictureURL: String}} author
 * @param {String} viewerId
 * @param {String} content of the story
 * @param {{isFavorite: Boolean, isBookmark: Boolean}} status
 * @param {Boolean} showIconBar if true, then always shows icon bar regardless of hover status. we might want to just deduce this from
 *    isTreeView, but I'm including this as a parameter in case we want extra control.
 * @param {Boolean} showAuthor used to conditionally render author name/picture
 * @param {{scale: Number, containerStyle: Object, onClick: Function}} treeStyle?
 *    specified for TreeView snippets. Contains all style, sizing data
 * @param {Function} updateLocalViewer handler function passed in to update the viewer's favs/bookmarks in whatever parent component
 * @param {Object} goTo
 * @param {{toggle: Function, setContentGenerator: Function}} popupHandlers
 */
const SingleSnippet = (props) => {
  const [isHover, setIsHover] = useState(false);
  const [isToTree, setIsToTree] = useState(false); //if true, then clicking redirects to treeview

  const style = props.treeStyle
    ? props.treeStyle.containerStyle
    : isToTree
    ? { backgroundColor: `rgba(0,0,0,0.1)`, cursor: `pointer` }
    : {};
  const clickHandler = props.treeStyle
    ? props.treeStyle.onClick
    : isToTree
    ? () => {
        props.popupHandlers.setContent([props.content]);
        props.popupHandlers.toggle("reader");
      }
    : () => null;

  const className =
    (props.treeStyle
      ? props.treeStyle.highlight
        ? "TreeViewSnippet-highlightContainer"
        : "TreeViewSnippet-container"
      : "SingleSnippet-container") + " u-flex";

  return (
    <>
      <div
        className={className}
        style={style}
        onClick={clickHandler}
        onMouseOver={(e) => {
          setIsHover(true);
          //things that shouldn't redirect to treeview (i.e. profile, icons) are suffixed with "else" in className
          if (!e.target.className.endsWith("else")) setIsToTree(true);
        }}
        onMouseOut={() => {
          setIsHover(false);
          setIsToTree(false);
        }}
      >
        {props.showAuthor ? (
          <SingleSnippetAuthorInfo author={props.author} goToProfile={props.goTo.profile} />
        ) : (
          <></>
        )}
        <div className="SingleSnippet-displayBox u-flexColumn">
          <div className="SingleSnippet-iconBar u-flex-end">
            {!props.treeStyle && (
              <Icon
                showByDefault={isHover || props.showIconBar}
                imgOn={sprout}
                imgOff={sprout}
                isActive={false}
                toggleActive={(c) => {
                  props.goTo.treeView(props._id);
                }}
              />
            )}
            {props.viewerId && (
              <Icon
                showByDefault={isHover || props.showIconBar}
                imgOn={filledHeart}
                imgOff={heart}
                isActive={props.status.isFavorite}
                toggleActive={(currState) => {
                  props.updateLocalViewer("favorites", props._id, currState ? "delete" : "add");
                  post("/api/snippet-attribs", {
                    _id: props._id,
                    state: !currState,
                    attrib: "favorites",
                    viewerId: props.viewerId,
                  });
                }}
              />
            )}
            {props.viewerId && (
              <Icon
                showByDefault={isHover || props.showIconBar}
                imgOn={filledBookmark}
                imgOff={bookmark}
                isActive={props.status.isBookmark}
                toggleActive={(currState) => {
                  props.updateLocalViewer("bookmarks", props._id, currState ? "delete" : "add");
                  post("/api/snippet-attribs", {
                    _id: props._id,
                    state: !currState,
                    attrib: "bookmarks",
                    viewerId: props.viewerId,
                  });
                }}
              />
            )}
          </div>
          <SingleSnippetContentBox content={props.content} />
        </div>
      </div>
    </>
  );
};

export default SingleSnippet;
