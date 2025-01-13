const Plan = require("../models/Plan");
const userModel = require("../models/userModel");
const JWT = require("jsonwebtoken");
const GlobalPlan = require("../models/GlobalPlan");
const { comparePasswordWithoutHashing } = require("../helpers/userHelper");
const sendEmail = require("../util/sendEmail");
const crypto = require("crypto"); // For generating a secure token

// //middleware
// const requireSingIn = jwt({
//   secret: process.env.JWT_SECRET,
//   algorithms: ["HS256"],
// });

//register

// const registerController = async (req, res) => {
//   try {
//     const { name, username, email, password, fcmToken } = req.body;
//     //validation
//     if (!name) {
//       return res.status(400).send({
//         success: false,
//         message: "name is required",
//       });
//     }

//     if (!username) {
//       return res.status(400).send({
//         success: false,
//         message: "username is required",
//       });
//     }
//     if (!email) {
//       return res.status(400).send({
//         success: false,
//         message: "email is required",
//       });
//     }
//     if (!password || password.length < 6) {
//       return res.status(400).send({
//         success: false,
//         message: "password is required and 6 character long",
//       });
//     }
//     //exisiting user
//     const exisitingUsername = await userModel.findOne({ username });
//     if (exisitingUsername) {
//       return res.status(500).send({
//         success: false,
//         message: "Username is Already Taken",
//       });
//     }

//     const exisitingEmail = await userModel.findOne({ email });
//     if (exisitingEmail) {
//       return res.status(500).send({
//         success: false,
//         message: "Email is Already Taken",
//       });
//     }

//     // //hashed pasword
//     // const hashedPassword = await hashPassword(password);

//     // //save user
//     const user = await userModel({
//       name,
//       username,
//       email,
//       password,
//       fcmToken,
//     }).save();

//     return res.status(201).send({
//       success: true,
//       message: "Registeration Successfull Please Login",
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).send({
//       success: false,
//       message: "Error in Register API",
//       error,
//     });
//   }
// };

const nodemailer = require("nodemailer");

// Configure Nodemailer transporter (example using Gmail)
// const transporter = nodemailer.createTransport({
//   service: "gmail", // Use your email service
//   auth: {
//     user: "sdchavan8070@gmail.com", // Your email
//     pass: "tjos zvii hngv fhni", // Your email password or app-specific password
//   },
// });
const transporter = nodemailer.createTransport({
  service: "gmail", // Use your email service
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASSWORD, // Your email password or app-specific password
  },
});

const resetPasswordController = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // Hash the token and find the user
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await userModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }, // Check if the token is still valid
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token." });
    }

    // Update the user's password and clear the reset token fields
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password reset successful." });
  } catch (error) {
    console.error("Error in resetPasswordController:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

const forgotPasswordController = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the email exists in the database
    const user = await userModel.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Email not found." });
    }

    // Generate a password reset token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Save the token and expiration time to the user document
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // Token expires in 10 minutes
    await user.save();

    // Send the password reset email
    const resetUrl = `http://www.meadhikari.com/reset-password/${resetToken}`;
    const message = `
      <h1>You have requested a password reset</h1>
      <p>Please click the link below to reset your password:</p>
      <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
      <p>This link will expire in 10 minutes.</p>
    `;

    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      text: `Please click the link to reset your password: ${resetUrl}`,
      html: message,
    });

    res
      .status(200)
      .json({ success: true, message: "Password reset email sent." });
  } catch (error) {
    console.error("Error in forgotPasswordController:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};
const registerController = async (req, res) => {
  try {
    const { name, username, email, password, fcmToken } = req.body;

    // Validation
    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Name is required",
      });
    }
    if (!username) {
      return res.status(400).send({
        success: false,
        message: "Username is required",
      });
    }
    if (!email) {
      return res.status(400).send({
        success: false,
        message: "Email is required",
      });
    }
    if (!password || password.length < 6) {
      return res.status(400).send({
        success: false,
        message: "Password is required and must be at least 6 characters long",
      });
    }

    // Check for existing user
    const existingUsername = await userModel.findOne({ username });
    if (existingUsername) {
      return res.status(400).send({
        success: false,
        message: "Username is already taken",
      });
    }

    const existingEmail = await userModel.findOne({ email });
    if (existingEmail) {
      return res.status(400).send({
        success: false,
        message: "Email is already taken",
      });
    }

    // Save user
    const user = await userModel({
      name,
      username,
      email,
      password,
      fcmToken,
    }).save();

    // Send registration success email
    const mailOptions = {
      from: "contact@meadhikari.com", // Sender email
      to: email, // User's email
      subject: "Registration Successful - Meadhikari 😎", // Email subject
      html: `
       <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* Responsive Styles */
    @media only screen and (max-width: 600px) {
      .header h1 {
        font-size: 20px !important;
      }
      .stats td {
        display: block;
        width: 100% !important;
        padding: 10px 0 !important;
      }
      .social-icons img {
        width: 30px !important;
        height: 30px !important;
      }
    }
  </style>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
  <!-- Header with Black Gradient -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #000000, #333333); padding: 20px 0; text-align: center;">
    <tr>
      <td>
        <img src="https://res.cloudinary.com/sdchavan/image/upload/v1730219215/xqhqdzggmwwdn2ws63eq.png" alt="Meadhikari Logo" style="width: 200px; height: auto;">
        <h1 class="header" style="color: #ffffff; margin: 10px 0 0; font-size: 24px;">Welcome to Meadhikari!</h1>
      </td>
    </tr>
  </table>

  <!-- Main Content -->
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
    <tr>
      <td style="padding: 20px;">
        <h2 style="color: #333333; font-size: 20px; margin-bottom: 20px;">Dear ${name},</h2>
        <p style="color: #555555; font-size: 16px; line-height: 1.6;">
          Your registration with <strong>Meadhikari</strong> was successful! Welcome to the ultimate platform for Maharashtra public service exams like MPSC, Talathi, Police Bharti, Gramsevak, Krushi Sevak, Arogya Bharti, and many more.
        </p>
        
        <!-- Login Details -->
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #333333; font-size: 16px; margin: 0;"><strong>Username:</strong> ${email}</p>
          <p style="color: #333333; font-size: 16px; margin: 10px 0 0;"><strong>Password:</strong> ${password}</p>
        </div>

        <p style="color: #555555; font-size: 16px; line-height: 1.6;">
          At Meadhikari, we provide you with the tools and resources you need to ace your exams. With access to <strong>2000+ Previous Year Question Papers</strong>, comprehensive study materials, and expert guidance, you’re now one step closer to achieving your dreams.
        </p>

        <!-- Stats Section -->
        <table class="stats" width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0; text-align: center; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px; border: 1px solid #e0e0e0;">
              <h3 style="color: #007BFF; font-size: 24px; margin: 0;">2000+</h3>
              <p style="color: #555555; font-size: 16px; margin: 5px 0;">Previous Year Question Papers</p>
            </td>
            <td style="padding: 10px; border: 1px solid #e0e0e0;">
              <h3 style="color: #007BFF; font-size: 24px; margin: 0;">7k+</h3>
              <p style="color: #555555; font-size: 16px; margin: 5px 0;">Daily Active Users</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e0e0e0;">
              <h3 style="color: #007BFF; font-size: 24px; margin: 0;">75+</h3>
              <p style="color: #555555; font-size: 16px; margin: 5px 0;">Exams Covered</p>
            </td>
            <td style="padding: 10px; border: 1px solid #e0e0e0;">
              <h3 style="color: #007BFF; font-size: 24px; margin: 0;">55k+</h3>
              <p style="color: #555555; font-size: 16px; margin: 5px 0;">Registered Users</p>
            </td>
          </tr>
        </table>

        <!-- Call to Action with Gradient -->
        <p style="color: #555555; font-size: 16px; line-height: 1.6;">Download our app on the <strong>Google Play Store</strong> to access all features on the go:</p>
        <a href="https://play.google.com/store/apps/details?id=com.sc.meadhikari" style="display: inline-block; background: linear-gradient(135deg, #007BFF, #00BFFF); color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; transition: background 0.3s ease;">Download Meadhikari App</a>

        <!-- Social Media Links -->
        <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-top: 20px;">Follow us on:</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="text-align: center; margin: 10px 0;">
          <tr>
            <td style="padding: 10px;">
              <a href="https://play.google.com/store/apps/details?id=com.sc.meadhikari" style="text-decoration: none;">
                <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Play Store" style="width: 120px; height: auto; transition: transform 0.3s ease;">
              </a>
            </td>
            <td style="padding: 10px;">
              <a href="https://www.youtube.com/@meadhikariacademy" style="text-decoration: none;">
                <img src="https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg" alt="YouTube" style="width: 40px; height: auto; transition: transform 0.3s ease;">
              </a>
            </td>
            <td style="padding: 10px;">
              <a href="https://instagram.com/meadhikari" style="text-decoration: none;">
                <img src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" alt="Instagram" style="width: 40px; height: auto; transition: transform 0.3s ease;">
              </a>
            </td>
          </tr>
        </table>

        <p style="color: #555555; font-size: 16px; line-height: 1.6;">Visit our website for more details: <a href="https://meadhikari.com" style="color: #007BFF; text-decoration: none;">www.meadhikari.com</a></p>

        <p style="color: #555555; font-size: 16px; line-height: 1.6;">Thank you for choosing Meadhikari. We're excited to be part of your journey towards success!</p>
      </td>
    </tr>
  </table>

  <!-- Footer -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #333333; padding: 20px 0; text-align: center;">
    <tr>
      <td>
        <p style="color: #ffffff; font-size: 14px; margin: 0;">&copy; 2025 Meadhikari. All rights reserved.</p>
        <p style="color: #ffffff; font-size: 14px; margin: 10px 0 0;">
          <a href="https://meadhikari.com/privacy-policy" style="color: #ffffff; text-decoration: none;">Privacy Policy</a>
         
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    return res.status(201).send({
      success: true,
      message: "Registration successful. Please check your email for details.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in Register API",
      error,
    });
  }
};

const updateUserBasicInfo = async (req, res) => {
  const { userId } = req.params; // Assuming you pass the userId in the URL params
  const { name, username, email, location, mobileNumber } = req.body;

  try {
    // Find the user by userId
    let user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    const existingUsername = await userModel.findOne({
      username,
      _id: { $ne: userId },
    });
    if (existingUsername) {
      return res.status(500).send({
        success: false,
        message: "Username is Already Taken",
      });
    }

    const exisitingEmail = await userModel.findOne({
      email,
      _id: { $ne: userId },
    });
    if (exisitingEmail) {
      return res.status(500).send({
        success: false,
        message: "Email is Already Taken",
      });
    }

    // Update user info fields
    user.name = name;
    user.username = username;
    user.email = email;
    user.location = location;
    user.mobileNumber = mobileNumber;

    // Save the updated user info
    await user.save();

    return res.status(200).send({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error updating user info:", error);
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const updateUserMobileNumber = async (req, res) => {
  const { userId } = req.params; // Assuming you pass the userId in the URL params
  const { mobileNumber } = req.body;

  try {
    // Find the user by userId
    let user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    user.mobileNumber = mobileNumber;

    // Save the updated user info
    await user.save();

    return res.status(200).send({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error updating user info:", error);
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const updateProfilePicture = async (req, res) => {
  const userId = req.params.userId; // Assuming the user ID is passed as a URL parameter
  const { profilePic } = req.body; // Assuming the profile picture URL or data is sent in the request body

  // console.log("=======profilePic====" + profilePic);

  try {
    // Find the user by ID
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update the profile picture URL or data
    user.profilePic = profilePic;

    // Save the updated user
    await user.save();

    res
      .status(200)
      .json({ message: "Profile picture updated successfully", user });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Assuming you're using Node.js with Express
const updateUserFCMToken = async (req, res) => {
  const { userId } = req.params;
  const { fcmToken } = req.body;

  try {
    // Find user by ID and update the FCM token
    const user = await userModel.findByIdAndUpdate(
      userId,
      { fcmToken },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error updating FCM token:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

//login
// const loginController = async (req, res) => {
//   try {
//     const { email, password, fcmToken } = req.body;
//     //validation
//     if (!email || !password) {
//       return res.status(500).send({
//         success: false,
//         message: "Please Provide Email Or Password",
//       });
//     }
//     // find user
//     const user = await userModel.findOne({ email });
//     if (!user) {
//       return res.status(500).send({
//         success: false,
//         message: "User Not Found",
//       });
//     }
//     //match password
//     // const match = await comparePassword(password, user.password);
//     // if (!match) {
//     //   return res.status(500).send({
//     //     success: false,
//     //     message: "Invalid usrname or password",
//     //   });
//     // }
//     //TOKEN JWT
//     const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "7d",
//     });

//     // undeinfed password
//     user.password = undefined;
//     res.status(200).send({
//       success: true,
//       message: "login successfully",
//       token,
//       user,
//       fcmToken,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).send({
//       success: false,
//       message: "error in login api",
//       error,
//     });
//   }
// };

const loginController = async (req, res) => {
  try {
    const { email, password, fcmToken } = req.body;
    //validation
    if (!email || !password) {
      return res.status(500).send({
        success: false,
        message: "Please Provide Email Or Password",
      });
    }
    // find user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // match password
    const match = await comparePasswordWithoutHashing(password, user.password);

    if (!match) {
      return res.status(500).send({
        success: false,
        message: "Invalid username or password",
      });
    }

    // Fetch global free plan status
    const globalPlan = await GlobalPlan.findOne({});
    const freePlan = await Plan.findOne({ name: "FREE" });

    // Set subscription dates based on globalPlan or default to new dates
    if (globalPlan.status === "Active" && !user.subscriptionPlanID) {
      const planId = freePlan._id;
      //   user.isSubscriptionActive = true;

      //   // Use globalPlan dates if available, otherwise set new dates
      //   user.subscriptionStartDate = new Date();
      //   user.subscriptionExpiryDate = new Date(
      //     user.subscriptionStartDate.getTime() + 30 * 24 * 60 * 60 * 1000
      //   );
      user.enableFreePlan(planId);
      await user.save();
    }

    // TOKEN JWT
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // undefined password
    user.password = undefined;
    res.status(200).send({
      success: true,
      message: "login successfully",
      token,
      user,
      fcmToken,
    });
  } catch (error) {
    // console.log(error);
    return res.status(500).send({
      success: false,
      message: "error in login api",
      error,
    });
  }
};

//update user
const updateUserController = async (req, res) => {
  try {
    const { name, password, email } = req.body;
    //user find
    const user = await userModel.findOne({ email });
    //password validate
    if (password && password.length < 6) {
      return res.status(400).send({
        success: false,
        message: "Password is required and should be 6 character long",
      });
    }
    const hashedPassword = password ? await hashPassword(password) : undefined;
    //updated useer
    const updatedUser = await userModel.findOneAndUpdate(
      { email },
      {
        name: name || user.name,
        password: hashedPassword || user.password,
      },
      { new: true }
    );
    updatedUser.password = undefined;
    res.status(200).send({
      success: true,
      message: "Profile Updated Please Login",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In User Update Api",
      error,
    });
  }
};

// Controller function to get a user by ID
// const getUserById = async (req, res) => {
//   const userId = req.params.id;

//   try {
//     const user = await userModel.findById(userId);
//     if (!user) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });
//     }

//     res.status(200).json({ success: true, user });
//   } catch (error) {
//     console.error("Error fetching user by ID:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// Controller function to get a user by ID
const getUserById = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check if the current date is greater than the subscription expiry date
    const currentDate = new Date();
    if (
      user.subscriptionExpiryDate &&
      currentDate > user.subscriptionExpiryDate
    ) {
      // Mark subscription as inactive and remove the plan ID
      user.isSubscriptionActive = false;
      user.subscriptionPlanID = null;
      await user.save(); // Save the updated user
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// const updateUserSubscription = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { newPlanId } = req.body;

//     // Validate newPlanId
//     if (!newPlanId) {
//       return res.status(400).json({ message: "New plan ID is required" });
//     }

//     // Find the new plan
//     const plan = await Plan.findById(newPlanId);
//     if (!plan) {
//       return res.status(404).json({ message: "Plan not found" });
//     }

//     // Find and update the user
//     const user = await userModel.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     user.subscriptionPlanID = newPlanId;
//     user.isSubscriptionActive = true; // Assuming you want to activate the subscription on update

//     await user.save();

//     res
//       .status(200)
//       .json({ message: "Subscription updated successfully", user });
//   } catch (error) {
//     console.error("Error updating subscription:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// const updateUserSubscription = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { newPlanId, purchasePaymentId } = req.body; // Include purchasePaymentId

//     // Validate newPlanId
//     if (!newPlanId) {
//       return res.status(400).json({ message: "New plan ID is required" });
//     }

//     // Find the new plan
//     const plan = await Plan.findById(newPlanId);
//     if (!plan) {
//       return res.status(404).json({ message: "Plan not found" });
//     }

//     // Find and update the user
//     const user = await userModel.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     user.subscriptionPlanID = newPlanId;
//     user.isSubscriptionActive = true; // Assuming you want to activate the subscription on update
//     user.purchasePaymentId = purchasePaymentId; // Update purchasePaymentId

//     await user.save();

//     res
//       .status(200)
//       .json({ message: "Subscription updated successfully", user });
//   } catch (error) {
//     console.error("Error updating subscription:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

const checkSubscriptionStatus = async (userId) => {
  try {
    const user = await userModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const now = new Date();
    if (user.subscriptionExpiryDate && now > user.subscriptionExpiryDate) {
      user.isSubscriptionActive = false;
      user.subscriptionPlanID = null;
      user.purchasePaymentId = null;
      user.subscriptionStartDate = null;
      user.subscriptionExpiryDate = null;

      await user.save();
    }

    return user.isSubscriptionActive;
  } catch (error) {
    console.error("Error checking subscription status:", error);
    throw new Error("Internal server error");
  }
};

// const updateUserSubscription = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { newPlanId, purchasePaymentId } = req.body;

//     if (!newPlanId) {
//       return res.status(400).json({ message: "New plan ID is required" });
//     }

//     const plan = await Plan.findById(newPlanId);
//     if (!plan) {
//       return res.status(404).json({ message: "Plan not found" });
//     }

//     const user = await userModel.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     user.subscriptionPlanID = newPlanId;
//     user.isSubscriptionActive = true;
//     user.purchasePaymentId = purchasePaymentId;
//     user.subscriptionStartDate = new Date(); // Set to current date

//     // Calculate expiry date based on plan duration (in months)
//     console.log("Plan" + plan);
//     console.log("Plan durationInMonths" + plan.durationInMonths);

//     const planDurationInMonths = plan.durationInMonths || 1; // Default to 1 month if not specified
//     const expiryDate = new Date();
//     expiryDate.setMonth(expiryDate.getMonth() + planDurationInMonths);
//     user.subscriptionExpiryDate = expiryDate;

//     await user.save();

//     res
//       .status(200)
//       .json({ message: "Subscription updated successfully", user });
//   } catch (error) {
//     console.error("Error updating subscription:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// const updateUserSubscription = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { newPlanId, purchasePaymentId } = req.body;

//     if (!newPlanId) {
//       return res.status(400).json({ message: "New plan ID is required" });
//     }

//     const plan = await Plan.findById(newPlanId);
//     if (!plan) {
//       return res.status(404).json({ message: "Plan not found" });
//     }

//     const user = await userModel.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     user.subscriptionPlanID = newPlanId;
//     user.isSubscriptionActive = true;
//     user.purchasePaymentId = purchasePaymentId;
//     user.subscriptionStartDate = new Date(); // Set to current date

//     // Calculate expiry date based on plan duration (in days)
//     const planDurationInDays = plan.durationInDays || 30; // Default to 30 days if not specified
//     const expiryDate = new Date();
//     expiryDate.setDate(expiryDate.getDate() + planDurationInDays);
//     user.subscriptionExpiryDate = expiryDate;

//     await user.save();

//     res
//       .status(200)
//       .json({ message: "Subscription updated successfully", user });
//   } catch (error) {
//     console.error("Error updating subscription:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

const updateUserSubscription = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPlanId, purchasePaymentId } = req.body;

    // Validate newPlanId
    if (!newPlanId) {
      return res.status(400).json({ message: "New plan ID is required" });
    }

    // Fetch the plan by ID
    const plan = await Plan.findById(newPlanId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    // Fetch the user by ID
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user subscription details
    user.subscriptionPlanID = newPlanId;
    user.isSubscriptionActive = true;
    user.purchasePaymentId = purchasePaymentId;
    user.subscriptionStartDate = new Date(); // Set the start date to the current date
    if (purchasePaymentId) {
      user.testsTaken = 0;
    }
    // Calculate the expiry date based on the plan duration
    const planDurationInDays = plan.durationInDays || 30; // Default to 30 days if not specified
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + planDurationInDays);
    user.subscriptionExpiryDate = expiryDate;

    // Save the updated user details
    await user.save();

    // Return updated subscription details in the response
    res.status(200).json({
      message: "Subscription updated successfully",
      user: {
        subscriptionPlanID: user.subscriptionPlanID,
        isSubscriptionActive: user.isSubscriptionActive,
        subscriptionStartDate: user.subscriptionStartDate,
        subscriptionExpiryDate: user.subscriptionExpiryDate,
        purchasePaymentId: user.purchasePaymentId,
      },
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  //requireSingIn,
  registerController,
  loginController,
  updateUserController,
  getUserById,
  updateUserFCMToken,
  updateUserBasicInfo,
  updateProfilePicture,
  updateUserSubscription,
  updateUserMobileNumber,
  resetPasswordController,
  forgotPasswordController,
};
