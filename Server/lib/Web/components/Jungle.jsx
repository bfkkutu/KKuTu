const React = require("react");

const Jungle = (props) => {
    return (
        <div id="Jungle">
            <span id="mobile">{props.mobile}</span>
            <img id="Background" className="jt-image" alt="Background" />
        </div>
    );
};

module.exports = Jungle;
