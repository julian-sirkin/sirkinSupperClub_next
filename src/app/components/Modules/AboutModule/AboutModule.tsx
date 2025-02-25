"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const AboutModule = () => {
  return (
    <div
      className="h-auto p-6 md:p-12 bg-black opacity-95 text-white"
      id="about"
    >
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center text-3xl md:text-5xl mb-6 text-gold"
      >
        Welcome to Sirkin Supper Club
      </motion.h2>

      <div className="md:grid lg:grid-cols-[auto_1fr] md:gap-6">
        {/* Image on the left */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <Image
            src="/images/pop_up_selfie.jpg"
            alt="Chef Julian Dinner Selfie"
            width={364}
            height={512}
            className="mb-4 md:mb-0 md:mx-auto lg:mx-0 rounded-lg shadow-md"
          />
        </motion.div>

        {/* Text content on the right */}
        <div className="md:space-y-4 md:col-span-1">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-xl md:text-2xl"
          >
            At Sirkin Supper Club, dining is more than just a meal—it&apos;s an
            experience. Imagine stepping into an intimate setting where the
            ambiance is as thoughtfully curated as the food on your plate. Each
            event is a unique gathering, where the evening&apos;s theme dictates
            the flavors and stories told through every course.
          </motion.p>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-xl md:text-2xl"
          >
            As a guest, you&apos;ll embark on a culinary journey of 4-8 courses,
            each meticulously crafted to surprise and delight your palate. The
            menu rotates with the seasons and is always driven by creativity,
            offering a fresh perspective on familiar dishes. It&apos;s a BYOB
            affair, allowing you to pair your favorite drinks with the
            evening&apos;s offerings, adding a personal touch to your dining
            experience.
          </motion.p>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="text-xl md:text-2xl"
          >
            But what truly sets Sirkin Supper Club apart is the social aspect.
            We believe that great food is best enjoyed with great company.
            You&apos;ll share your meal with like-minded strangers, transforming
            a simple dinner into a communal celebration. Even if you come with
            friends, the communal table encourages new connections, making each
            event as much about the people as it is about the food.
          </motion.p>

          {/* Full-width text after clearing the image */}
          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="font-bold text-3xl mt-6 mb-2 lg:col-span-2 lg:grid lg:grid-cols-1 text-gold"
          >
            About Julian Sirkin
          </motion.h3>
          
          <div className="lg:col-span-2 lg:grid lg:grid-cols-1">
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="text-xl md:text-2xl"
            >
              The creative force behind Sirkin Supper Club is Julian Sirkin, a
              chef whose culinary journey has been anything but ordinary.
              Julian&apos;s passion for food was ignited in a small, innovative
              bistro where creativity was encouraged at every turn. It was here
              that Julian had his first taste of culinary experimentation. When
              he confessed to his chef that he had never opened an oyster, the
              chef ordered a batch and challenged him to create something
              special. Julian&apos;s idea, with a slight adjustment from the
              chef, became a weekend special, sparking his love for inventing
              new dishes.
            </motion.p>
          </div>
        </div>
      </div>

      {/* Remaining full-width text */}
      <div className="mt-6 space-y-4 lg:col-span-2 lg:grid lg:grid-cols-1">
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="text-xl md:text-2xl"
        >
          Julian&apos;s culinary career took him through several esteemed
          kitchens, including an internship with a Michelin-starred chef in New
          York City and a tenure as a sous chef at Patina 250. Each of these
          experiences shaped his approach to cooking, instilling in him a deep
          appreciation for both technical skill and creative flair.
        </motion.p>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="text-xl md:text-2xl"
        >
          Sirkin Supper Club began almost by accident. While waiting for a
          seasonal job to start, Julian found himself with time on his hands and
          a desire to create. What started as a way to pass the time—putting a
          menu online, hiring a couple of friends, and hosting his first
          pop-up—quickly turned into a passion. Julian became hooked on these
          dinners, finding joy in the unique, ephemeral nature of each event.
          Even while working full-time as a chef, he continued to host these
          pop-ups, drawn to the creative freedom they offered.
        </motion.p>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.0 }}
          className="text-xl md:text-2xl"
        >
          Now that Julian has transitioned to a new career, Sirkin Supper Club
          keeps him connected to the world of food and hospitality that he loves
          but stepped away from. Every dish is a reflection of his unique
          perspective—blending his high-end restaurant experience with a desire
          to create memorable, hospitable dining experiences. At Sirkin Supper
          Club, Julian takes well-established dishes and presents them through a
          new lens, challenging the conventional and delivering something truly
          special.
        </motion.p>
      </div>
    </div>
  );
};

export default AboutModule;
