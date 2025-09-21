export const checkRole = (roles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ msg: "Unauthorized: No user found" });
        }

        // console.log(req.user.role);
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ msg: "Forbidden: Access denied" });
        }

        next();
    };
};