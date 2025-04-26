import './App.css';

function CustomButton({ buttonText, functionName }) {
  return (
    <button className="Button" onClick={functionName}>
      {buttonText}
    </button>
  );
}

export default CustomButton;