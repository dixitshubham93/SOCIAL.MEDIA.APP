const envHandler = (resource) => {
    try {
        if (!resource || isNaN(resource)) throw new Error("Invalid or missing PORT value");
        return resource;
    } catch (err) {
        console.log("This is an env file error. Please check the env file.");
        process.exit(1); // Exit the app if there's an issue with env variables
    }
};

export {envHandler};