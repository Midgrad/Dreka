#ifndef OPENSKY_ADSB_SOURCE_H
#define OPENSKY_ADSB_SOURCE_H

#include "i_adsb_source.h"

#include <QNetworkAccessManager>
#include <QPointer>

namespace dreka::domain
{
class OpenskyAdsbSource : public IAdsbSource
{
    Q_OBJECT

public:
    explicit OpenskyAdsbSource(QObject* parent = nullptr);

    void start() override;
    void stop() override;

private slots:
    void get(const QString& request);

    void onFinished(QNetworkReply* reply);

private:
    QNetworkAccessManager m_manager;
    QPointer<QNetworkReply> m_lastReply;
    bool m_started = false;
};

} // namespace dreka::domain

#endif // OPENSKY_ADSB_SOURCE_H
