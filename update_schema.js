const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

const idsToCascade = ['doctorId', 'followerId', 'followingId', 'senderId', 'receiverId', 'consultantId', 'authorId'];

for (const id of idsToCascade) {
  const regex = new RegExp(`(@relation\\([^)]*fields:\\s*\\[${id}\\],[^)]*references:\\s*\\[id\\][^)]*)(\\))`, 'g');
  schema = schema.replace(regex, (match, p1, p2) => {
    if (p1.includes('onDelete: Cascade')) return match;
    return p1 + ', onDelete: Cascade)';
  });
}

fs.writeFileSync('prisma/schema.prisma', schema);
console.log('Schema updated successfully');
