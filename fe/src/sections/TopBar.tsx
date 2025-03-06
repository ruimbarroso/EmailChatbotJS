
const TopBar = () => {
    return (<div id="top-bar" className="bg-amber-200 flex justify-between items-center box-border w-dvw p-4 h-25">
        <div className="w-20 md:w-1/6 lg:w-1/5">
            <div id="top-bar-img" className="bg-blue-400 box-content w-15 h-15 ml-2 sm:hidden"></div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center">
            EmailChatbot JS
        </h1>

        <div className="flex flex-col-reverse items-center justify-end md:flex-row md:items-end lg:w-1/5">
            <p id="top-bar-email">test@gmail.com</p>
            <div id="top-bar-img" className="bg-blue-400 box-content w-15 h-15 ml-2"></div>
        </div>

    </div>
    );
};
export default TopBar;