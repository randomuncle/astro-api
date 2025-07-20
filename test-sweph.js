try {
  const sweph = require('sweph');
  console.log('✅ sweph available:', !!sweph);
  console.log('📦 version:', sweph.version());
  
  // Set ephemeris path
  const ephePath = process.env.EPHE_PATH || './ephemeris';
  console.log('🗂️ Setting ephemeris path to:', ephePath);
  sweph.set_ephe_path(ephePath);
  
  // Test basic calculation
  const jd = 2448027.1048285183; // Test Julian Day
  const result = sweph.calc_ut(jd, sweph.constants.SE_SUN, sweph.constants.SEFLG_SWIEPH);
  console.log('🌞 Sun calculation result:', result);
  
  if (result.flag === sweph.constants.OK) {
    console.log('✅ Calculation successful!');
  } else {
    console.log('⚠️ Calculation warning/error:', result.error);
  }
  
} catch(e) {
  console.log('❌ sweph error:', e.message);
  console.log('📋 Stack:', e.stack);
}