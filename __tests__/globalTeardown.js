// drop tables
module.exports = async function () {
  await global.__db__.close()
}