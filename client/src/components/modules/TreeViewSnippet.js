import React from "react";
import "./TreeViewSnippet.css";
import { assembleStyle } from "../../utils/treeview.utils";
import SingleSnippet from "./SingleSnippet.js";

/**
 * proptypes
 * @param {pos: Object, size: Object} container
 * @param {String} authorName
 * @param {String} authorId
 * @param {String} content
 * @param {String} _id
 * @param {Boolean} highlight
 * @param {Object} line object containing all position/sizing data for lines
 * @param {Boolean} inTargetThread
 * @param {Boolean} isTarget
 * @param {Function} onClick
 * @param {Number} scale
 * @param {[String]} userBookmarks
 * @param {[String]} userFavorites
 */
const TreeViewSnippet = (props) => {
  const { highlight, inTargetThread, isTarget } = props;
  const containerStyle = assembleStyle(
    props.container,
    highlight && inTargetThread,
    undefined,
    props.scale
  );
  const upLineFromParentStyle = props.line.fromParent
    ? assembleStyle(props.line.fromParent.up, highlight && inTargetThread, 1)
    : undefined;
  const horizontalLineFromParentStyle = props.line.fromParent
    ? assembleStyle(props.line.fromParent.horizontal, highlight && inTargetThread, 0)
    : undefined;
  const lineToChildStyle = props.line.toChild
    ? assembleStyle(props.line.toChild, highlight && inTargetThread && !isTarget, 1)
    : undefined;

  return (
    <>
      <SingleSnippet
        authorName={props.authorName}
        authorId={props.authorId}
        content={props.content}
        _id={props._id}
        isTreeView={true}
        showAuthor={true}
        isFavorite={props.userFavorites.has(props._id)}
        isBookmarked={props.userBookmarked.has(props._id)}
        showIconBar={true}
        style={containerStyle}
        onClick={props.onClick}
      />
      {props.line.fromParent ? (
        <>
          <div style={upLineFromParentStyle}></div>
          <div style={horizontalLineFromParentStyle}></div>
        </>
      ) : (
        <></>
      )}
      {props.line.toChild ? <div style={lineToChildStyle}></div> : <></>}
    </>
  );
};

export default TreeViewSnippet;
