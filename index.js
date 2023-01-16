const nbt = require("nbt");
const fs = require("fs");
const zlib = require("zlib");
const winston = require("winston")

const file = fs.readFileSync("./world/level.dat");

// Console log to a file
const { combine, timestamp, label, printf } = winston.format;
const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});
const logger = winston.createLogger({
  level: 'debug',
  format: combine(
    label({ label: 'from-the-fog-world-fixer' }),
    timestamp(),
    myFormat
  ),
  transports: [
    new winston.transports.File({
      filename: 'console.log',
      options: { flags: 'a' },
    }),
    new winston.transports.Console()
  ]
});
console.log = logger.info.bind(logger);
console.error = logger.error.bind(logger);
console.warn = logger.warn.bind(logger);

  // Check for specified values and remove them
nbt.parse(file, (error, data) => {
  if (error) throw error;

  // Check if the dimensions tag exists
  if (data.value.Data.value.WorldGenSettings.value.dimensions) {
    // Retrieve world name
    const LevelName = data.value.Data.value.LevelName.value
    // Find the overworld dimension and remove it
    delete data.value.Data.value.WorldGenSettings.value.dimensions.value[
      "minecraft:overworld"
    ];
    console.log(`Removed Overworld Dimension Settings from ${LevelName}!`);
  }

  // Write the changes to the file
  const newFile = Buffer.from(nbt.writeUncompressed(data));
  // Compress the data into the gzip format
  zlib.gzip(newFile, (error, result) => {
    if (error) throw error;

    // Write the compressed data to the file
    fs.writeFileSync("./world/level.dat", result);
    console.log("File compressed successfully!");
  });
});
