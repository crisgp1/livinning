// Enable debugging logs in the browser console
// Run this in the browser console: localStorage.setItem('DEBUG_LOGS', 'true')
// Or disable with: localStorage.removeItem('DEBUG_LOGS')

console.log('🔧 Livinning Debug Helper Loaded');
console.log('💡 Available commands:');
console.log('  - enableLogs()     : Enable all logging');
console.log('  - disableLogs()    : Disable all logging');
console.log('  - checkLogsStatus(): Check current logging status');
console.log('  - filterLogs(type) : Filter console by log type');
console.log('  - exportLogs()     : Export log history');
console.log('  - clearLogs()      : Clear log history');

window.enableLogs = function() {
  localStorage.setItem('DEBUG_LOGS', 'true');
  console.log('✅ Debugging logs enabled. Refresh the page to see logs.');
};

window.disableLogs = function() {
  localStorage.removeItem('DEBUG_LOGS');
  console.log('❌ Debugging logs disabled. Refresh the page.');
};

window.checkLogsStatus = function() {
  const enabled = localStorage.getItem('DEBUG_LOGS') === 'true';
  console.log(`📊 Logs are currently: ${enabled ? 'ENABLED' : 'DISABLED'}`);
  return enabled;
};

window.filterLogs = function(type) {
  const filters = {
    database: '🗄️',
    api: '🌐',
    user: '👤',
    navigation: '🧭',
    performance: '⚡',
    error: '❌',
    warn: '⚠️',
    info: 'ℹ️',
    debug: '🔍'
  };
  
  if (type && filters[type]) {
    console.log(`🔍 Filtering console for ${type} logs (${filters[type]})`);
    console.log(`💡 Look for logs starting with ${filters[type]}`);
  } else {
    console.log('📝 Available log types:', Object.keys(filters).join(', '));
  }
};

window.exportLogs = function() {
  if (window.logger && typeof window.logger.exportLogs === 'function') {
    const logs = window.logger.exportLogs();
    console.log('📄 Exported logs:', logs);
    // Create downloadable file
    const blob = new Blob([logs], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `livinning-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } else {
    console.log('❌ Logger not available or logs not accessible');
  }
};

window.clearLogs = function() {
  if (window.logger && typeof window.logger.clearHistory === 'function') {
    window.logger.clearHistory();
    console.log('🗑️ Log history cleared');
  } else {
    console.log('❌ Logger not available');
  }
};

window.getLogStats = function() {
  if (window.logger && typeof window.logger.getStatus === 'function') {
    const status = window.logger.getStatus();
    console.log('📊 Logger Status:', status);
    return status;
  } else {
    console.log('❌ Logger not available');
  }
};

// Auto-enable logs in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  if (!localStorage.getItem('DEBUG_LOGS')) {
    localStorage.setItem('DEBUG_LOGS', 'true');
    console.log('🚀 Auto-enabled logs for development environment');
  }
}