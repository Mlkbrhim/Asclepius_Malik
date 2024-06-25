const Hapi = require('@hapi/hapi');
const { v4: uuidv4 } = require('uuid');

// Fungsi untuk memprediksi (mock untuk contoh ini)
const predictCancer = (image) => {
    // Simulasikan prediksi dengan mengembalikan "Cancer"
    return "Cancer";
};

// Inisialisasi server
const init = async () => {
    const server = Hapi.server({
        port: 3000,
        host: 'localhost',
        routes: {
            payload: {
                maxBytes: 1000000, // 1MB
                parse: true,
                multipart: true,
            }
        }
    });

    // Route untuk upload gambar dan prediksi
    server.route({
        method: 'POST',
        path: '/predict',
        options: {
            payload: {
                output: 'stream',
                allow: 'multipart/form-data'
            }
        },
        handler: async (request, h) => {
            const data = request.payload;

            if (!data.file) {
                return h.response({
                    status: 'fail',
                    message: 'Terjadi kesalahan dalam melakukan prediksi'
                }).code(400);
            }

            const file = data.file;

            // Check file size
            if (file.hapi.headers['content-length'] > 1000000) {
                return h.response({
                    status: 'fail',
                    message: 'Payload content length greater than maximum allowed: 1000000'
                }).code(413);
            }

            try {
                // Baca file stream (untuk contoh ini, kita tidak benar-benar memproses file)
                let result = predictCancer(file);

                return h.response({
                    status: 'success',
                    message: 'Model is predicted successfully',
                    data: {
                        id: uuidv4(),
                        result: result,
                        suggestion: 'Segera periksa ke dokter!',
                        createdAt: new Date().toISOString()
                    }
                }).code(200);
            } catch (error) {
                return h.response({
                    status: 'fail',
                    message: 'Terjadi kesalahan dalam melakukan prediksi'
                }).code(400);
            }
        }
    });

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();
