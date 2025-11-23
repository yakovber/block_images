async function logActivity(userEmail, action, details, trx) {
  await trx('activity_log').insert({
    email: userEmail,
    action,
    details: JSON.stringify(details),
    created_at: new Date()
  });
}
 module.exports = {
  logActivity
};