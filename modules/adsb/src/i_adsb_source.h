#ifndef I_ADSB_SOURCE_H
#define I_ADSB_SOURCE_H

#include <QJsonArray>
#include <QObject>

namespace dreka::domain
{
class IAdsbSource : public QObject
{
    Q_OBJECT

public:
    IAdsbSource(QObject* parent = nullptr) : QObject(parent)
    {
    }

    virtual void start() = 0;
    virtual void stop() = 0;

signals:
    void adsbDataReceived(QJsonArray data);
};

} // namespace dreka::domain

#endif // I_ADSB_SOURCE_H
