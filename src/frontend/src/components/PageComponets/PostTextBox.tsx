import React from "react";

interface PostTextBoxProps {
  postText: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const PostTextBox: React.FC<PostTextBoxProps> = ({ postText, onChange }) => {
  return (
    <>
      <span
        style={{
          alignSelf: "flex-end",
          fontSize: "0.85rem",
          margin: "0px",
          color: "#555",
        }}
      >
        {280 - postText.length} characters left
      </span>
      <textarea
        placeholder="Share something..."
        className="share-input"
        maxLength={280}
        value={postText}
        onChange={onChange}
      />
    </>
  );
};

export default PostTextBox;
