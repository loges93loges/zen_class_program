// queries.js

// Connect to the database
const { MongoClient } = require('mongodb');
const uri = "mongodb://localhost:27017/"; // Replace with your MongoDB connection string
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const database = client.db('zenclass');

    // Collection references
    const topics = database.collection('topics');
    const tasks = database.collection('tasks');
    const company_drives = database.collection('company_drives');
    const codekata = database.collection('codekata');
    const mentors = database.collection('mentors');
    const attendance = database.collection('attendance');

    // Queries

    // Find all the topics and tasks which are taught in the month of October
    const octoberTopics = await topics.find({ date: { $gte: new Date("2020-10-01"), $lt: new Date("2020-11-01") } }).toArray();
    console.log("October Topics:", octoberTopics);

    const octoberTasks = await tasks.find({ date: { $gte: new Date("2020-10-01"), $lt: new Date("2020-11-01") } }).toArray();
    console.log("October Tasks:", octoberTasks);

    // Find all the company drives which appeared between 15 Oct 2020 and 31 Oct 2020
    const octoberDrives = await company_drives.find({ date: { $gte: new Date("2020-10-15"), $lt: new Date("2020-11-01") } }).toArray();
    console.log("October Drives:", octoberDrives);

    // Find all the company drives and students who appeared for the placement
    const drivesAndStudents = await company_drives.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "appeared_students",
          foreignField: "_id",
          as: "students"
        }
      }
    ]).toArray();
    console.log("Drives and Students:", drivesAndStudents);

    // Find the number of problems solved by the user in codekata
    const problemsSolved = await codekata.aggregate([
      {
        $group: {
          _id: "$user_id",
          totalProblemsSolved: { $sum: "$problems_solved" }
        }
      }
    ]).toArray();
    console.log("Problems Solved:", problemsSolved);

    // Find all the mentors with mentees count more than 15
    const mentorsWithMentees = await mentors.find({ "mentees.15": { $exists: true } }).toArray();
    console.log("Mentors with more than 15 mentees:", mentorsWithMentees);

    // Find the number of users who are absent and tasks are not submitted between 15 Oct 2020 and 31 Oct 2020
    const absentUsersAndUnsubmittedTasks = await attendance.aggregate([
      {
        $match: {
          date: { $gte: new Date("2020-10-15"), $lt: new Date("2020-11-01") },
          status: "absent"
        }
      },
      {
        $lookup: {
          from: "tasks",
          let: { user_id: "$user_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $gte: ["$date", new Date("2020-10-15")] },
                    { $lt: ["$date", new Date("2020-11-01")] },
                    { $not: { $in: ["$$user_id", "$submitted_by"] } }
                  ]
                }
              }
            }
          ],
          as: "unsubmitted_tasks"
        }
      },
      {
        $match: { "unsubmitted_tasks.0": { $exists: true } }
      },
      {
        $group: {
          _id: "$user_id",
          count: { $sum: 1 }
        }
      }
    ]).toArray();
    console.log("Absent Users and Unsubmitted Tasks:", absentUsersAndUnsubmittedTasks);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);

