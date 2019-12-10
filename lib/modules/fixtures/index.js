const config = require('config')

module.exports = {
  construct(self, options) {
    const req = self.apos.tasks.getReq()

    /**
     * Run with "node app fixtures:users"
     */
    self.addTask('users', 'Run project owners fixtures', () => runBasicUsers())

    async function runBasicUsers() {
      try {
        self.apos.log.info('******** Start basic users fixtures ********')
        const removedPieces = await self.apos.docs.db.remove({
          type: 'apostrophe-user',
          username: { $in: ['admin'] },
        })
        const usersCollection = self.apos.db.collection('aposUsersSafe')
        const removedUsers = await usersCollection.remove({
          username: { $in: ['admin'] },
        })
        if (removedPieces.length > 0) {
          self.apos.log.info(`User "admin" removed: ${removedUsers.result}`)
        }

        let adminGroup = await self.apos.groups
          .find(req, { title: 'admin' })
          .permission(false)
          .toObject()
        if (!adminGroup) {
          adminGroup = await self.apos.groups.insert(
            req,
            { title: 'admin', permissions: ['admin'] },
            { permissions: false },
          )
          self.apos.log.info('Admin group created')
        }

        await self.apos.users.insert(
          req,
          {
            username: 'admin',
            password: config.get('apostrophe-users.admin.password'),
            title: 'admin',
            firstName: 'admin',
            groupIds: [adminGroup._id],
          },
          { permissions: false },
        )

        self.apos.log.info('******** User "admin" added ********')
      } catch (error) {
        self.apos.log.error(`Error in runBasicUsers: ${error.message}`)
      }
    }
  },
}
