const NoChatsFound = () => {
  return (
    <div className="card bg-base-200 p-6 text-center">
      <h3 className="font-semibold text-lg mb-2">No chat history yet</h3>
      <p className="text-base-content opacity-70">
        Start a conversation with your friends to see them here!
      </p>
    </div>
  );
};

export default NoChatsFound;