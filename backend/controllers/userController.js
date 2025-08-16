// import { EventEmitterAsyncResource } from "nodemailer/lib/xoauth2/index.js";
import userModel from "../models/userModel.js";



export const getUserData = async (req, res) => {
    try{
        const userId = req.user?.id;

        if (!userId) {
            return res.status(400).json({ 
                success: false,
                isAuthenticated: false,
                userData: null,
               message: "User not logged in" });
        }
        
        // const user = await userModel.findById(userId);

        const user = await userModel.findById(userId).select("name isAccountVerified");

        if(!user){
            return res.status(404).json({ success: false, 
                isAuthenticated: false,
                userData: null,
                message: "User not found" });
        }

        res.json({
            success: true,
            isAuthenticated: true,
            userData: {
                name: user.name,
                isAccountVerified: user.isAccountVerified, 
            }
        })
    }catch(error) {
    res.status(500).json({ success: false, message: error.message });
}

}


//Get All the user data
export const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find();

        res.status(200).json({
            success: true,
            users: users.map(user => ({ 
                userId: user._id,
                name: user.name,
                email: user.email,
                isBlocked: user.isBlocked,
                isAccountVerified: user.isAccountVerified
            }))
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

//Update user block status

export const updateBlockStatus = async (req, res) => {
    try {
        
        let { userId, block } = req.body;

        // Convert "true"/"false" string to actual boolean
        if (typeof block === 'string') {
            block = block.toLowerCase() === 'true';
        }

        if (!userId || typeof block !== 'boolean') {
            return res.status(400).json({ success: false, message: "userId and block (boolean) are required" });
        }

        const user = await userModel.findByIdAndUpdate(userId, { isBlocked: block }, { new: true });

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        res.json({ success: true, message: `User has been ${block ? "blocked" : "unblocked"}` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};




//  Get User Profile
export const getUserProfile = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        res.status(200).json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

//  Edit User Profile
export const updateUserProfile = async (req, res) => {
    try {
        const { name, email } = req.body;

        const user = await userModel.findByIdAndUpdate(
            req.user.id,
            { name, email },
            { new: true }
        ).select("-password");

        res.status(200).json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


// Set Default Address

export const setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Loop through addresses and set isDefault
    user.addresses.forEach(address => {
      address.isDefault = address._id.toString() === addressId;
    });

    await user.save();

    res.status(200).json({ success: true, message: "Default address set", addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


//  Add Address
export const addAddress = async (req, res) => {
    try {
        const { street, city, state, zip, country } = req.body;

        const user = await userModel.findById(req.user.id);
        user.addresses.push({ street, city, state, zip, country });
        await user.save();

        res.status(201).json({ success: true, message: "Address added", addresses: user.addresses });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

//  Get Addresses
export const getAddresses = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id).select("addresses");
        res.status(200).json({ success: true, addresses: user.addresses });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


export const updateAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const { street, city, state, zip, country } = req.body;

        const user = await userModel.findById(req.user.id);
        const address = user.addresses.id(addressId);

        if(!address) {
            return res.status(404).json({ success: false, message: "Address not found" });
        }

        address.street = street;
        address.city = city;
        address.state = state;
        address.zip = zip;
        address.country = country;

        await user.save();

        res.status(200).json({ success: true, message: "Address updated", addresses: user.addresses });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });

    }
}

// Delete Address
export const deleteAddress = async (req, res) => {
    try {
        const { addressId } = req.params;

        const user = await userModel.findById(req.user.id);

        // Check if the address exists
        const address = user.addresses.id(addressId);
        if (!address) {
            return res.status(404).json({ success: false, message: "Address not found" });
        }

        // Remove the address
        user.addresses.pull({_id : addressId})
        await user.save();

        res.status(200).json({ success: true, message: "Address deleted", addresses: user.addresses });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


// Cancel Order
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const user = await userModel.findById(req.user.id);

    const order = user.orders.find(order => order.orderId === orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.status !== "pending") {
      return res.status(400).json({ success: false, message: "Only pending orders can be cancelled" });
    }

    // Update order status
    order.status = "cancelled";
    await user.save();

    res.status(200).json({ success: true, message: "Order cancelled successfully" });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};