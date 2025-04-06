import React from "react";
import "../../Styles/Feed.css";

interface PostUploadProps {
  onClick?: () => void;
}

const PostUpload: React.FC<PostUploadProps> = ({ onClick }) => {
  return (
    <button className="upload-btn" onClick={onClick}>
      Upload
    </button>
  );
};

export default PostUpload;
