#ifndef OPENSKY_CLIENT_H
#define OPENSKY_CLIENT_H

#include <QJsonArray>
#include <QNetworkAccessManager>

namespace dreka::domain
{
class OpenskyClient : public QObject
{
    Q_OBJECT

public:
    explicit OpenskyClient(QObject* parent = nullptr);

    void start();

signals:
    void adsbDataReceived(QJsonArray data);

private slots:
    void get(const QString& request);

    void onFinished(QNetworkReply* reply);

private:
    QNetworkAccessManager m_manager;
};

} // namespace dreka::domain

#endif // OPENSKY_CLIENT_H
