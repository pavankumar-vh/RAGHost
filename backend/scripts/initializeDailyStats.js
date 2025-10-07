import mongoose from 'mongoose';
import Bot from '../models/Bot.js';
import dotenv from 'dotenv';

dotenv.config();

const initializeDailyStats = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all bots
    const bots = await Bot.find({});
    console.log(`📊 Found ${bots.length} bots`);

    let updatedCount = 0;
    let alreadyHadStats = 0;

    for (const bot of bots) {
      console.log(`\n🤖 Bot: ${bot.name} (ID: ${bot._id})`);
      console.log(`   Current dailyStats: ${bot.dailyStats ? bot.dailyStats.length : 0} entries`);
      console.log(`   Total Queries: ${bot.totalQueries || 0}`);

      if (!bot.dailyStats || bot.dailyStats.length === 0) {
        // Initialize with empty array if not exists
        bot.dailyStats = [];
        
        // If the bot has queries but no daily stats, create a dummy entry for today
        if (bot.totalQueries > 0) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          bot.dailyStats.push({
            date: today,
            queries: bot.totalQueries,
            tokens: bot.totalTokensUsed || 0,
            avgResponseTime: bot.avgResponseTime || 0,
          });
          
          console.log(`   ✅ Created initial daily stat entry for today`);
        }
        
        await bot.save();
        updatedCount++;
        console.log(`   ✅ Initialized dailyStats`);
      } else {
        alreadyHadStats++;
        console.log(`   ℹ️  Already has ${bot.dailyStats.length} daily stats`);
        
        // Log the stats
        bot.dailyStats.forEach(stat => {
          console.log(`      - ${stat.date.toISOString().split('T')[0]}: ${stat.queries} queries, ${stat.tokens} tokens`);
        });
      }
    }

    console.log('\n📈 Summary:');
    console.log(`   Total bots: ${bots.length}`);
    console.log(`   Bots updated: ${updatedCount}`);
    console.log(`   Bots with existing stats: ${alreadyHadStats}`);
    
    console.log('\n✅ Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

initializeDailyStats();
