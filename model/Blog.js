const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "ব্লগের শিরোনাম অবশ্যই দিতে হবে"],
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true, // URL-এ ব্যবহারের জন্য (যেমন: my-blog-post)
        lowercase: true
    },
    content: {
        type: String, 
        required: [true, "ব্লগের মূল কন্টেন্ট লিখুন"] // এখানে HTML বা Markdown স্ট্রিং হিসেবে ডাটা সেভ হবে
    },
    excerpt: {
        type: String, // কার্ডে দেখানোর জন্য ছোট সারাংশ
        required: true
    },
    author: {
        name: { type: String, default: "Masudur Rahman" },
        role: { type: String, default: "Director, ALO" },
        image: { type: String } // লেখকের প্রোফাইল পিকচার ইউআরএল
    },
    category: {
        type: String,
        enum: ['Agriculture', 'Education', 'Community', 'Success Story', 'Events'],
        default: 'Community'
    },
    featuredImage: {
        type: String, // ইমেজের পাথ বা ইউআরএল
        required: true
    },
    tags: [String], // ['farming', 'naogaon', 'organic']
    isPublished: {
        type: Boolean,
        default: false
    },
    views: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true // এটি অটোমেটিক createdAt এবং updatedAt তৈরি করে দেবে
});

// শিরোনাম থেকে অটো স্লাগ জেনারেট করার জন্য মিডলওয়্যার (ঐচ্ছিক)
blogSchema.pre('validate', async function() {
    if (this.title) {
        this.slug = this.title
            .toLowerCase()
            .trim() // দুই পাশের বাড়তি স্পেস বাদ দেবে
            .replace(/[^\w\s-]/g, '') // স্পেশাল ক্যারেক্টার বাদ দেবে
            .replace(/\s+/g, '-');    // স্পেসকে ড্যাশ দিয়ে রিপ্লেস করবে
    }
    
});
module.exports = mongoose.model('Blog', blogSchema);